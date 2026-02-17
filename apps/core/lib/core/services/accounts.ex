defmodule Core.Services.Accounts do
  use Core.Services.Base
  import Core.Policies.Account
  alias Core.PubSub
  alias Core.Services.{Users, Payments}
  alias Core.Auth.Jwt
  alias Core.Schema.{
    User,
    Account,
    Group,
    GroupMember,
    Invite,
    Role,
    IntegrationWebhook,
    OAuthIntegration,
    OIDCProvider,
    DomainMapping,
    RoleBinding,
    ImpersonationPolicyBinding,
    DnsAccessPolicyBinding,
    PlatformPlan,
    PlatformSubscription,
  }

  @type error :: {:error, term}
  @type account_resp :: {:ok, Account.t} | error
  @type group_resp :: {:ok, Group.t} | error
  @type group_member_resp :: {:ok, GroupMember.t} | error
  @type invite_resp :: {:ok, Invite.t} | error
  @type role_resp :: {:ok, Role.t} | error
  @type user_resp :: {:ok, User.t} | error
  @type webhook_resp :: {:ok, IntegrationWebhook.t} | error
  @type binding :: RoleBinding.t | ImpersonationPolicyBinding.t | DnsAccessPolicyBinding.t

  def get_account!(id), do: Core.Repo.get!(Account, id)

  def get_account(id), do: Core.Repo.get(Account, id)

  def get_group!(id), do: Core.Repo.get!(Group, id)

  def get_group_by_name(aid, name), do: Core.Repo.get_by(Group, name: name, account_id: aid)

  def get_invite!(id), do: Core.Repo.get_by!(Invite, secure_id: id)

  def get_invite(id), do: Core.Repo.get_by(Invite, secure_id: id)

  def get_role(id), do: Core.Repo.get(Role, id)

  def get_role!(id), do: Core.Repo.get!(Role, id)

  def get_webhook!(id), do: Core.Repo.get!(IntegrationWebhook, id)

  def get_group_member(group_id, user_id),
    do: Core.Repo.get_by(GroupMember, user_id: user_id, group_id: group_id)

  def get_oauth_integration!(service, account_id),
    do: Core.Repo.get_by!(OAuthIntegration, service: service, account_id: account_id)

  def get_domain_mapping(domain),
    do: Core.Repo.get_by(DomainMapping, domain: domain)

  def get_mapping_for_email(email) do
    case String.split(email, "@") do
      [_, domain] ->
        get_domain_mapping(domain)
        |> Core.Repo.preload([:account])
      _ -> nil
    end
  end

  @doc """
  Creates a fresh account for the user, making him the root user. Returns everything to caller
  """
  @spec create_account(User.t) :: {:ok, %{account: Account.t, user: User.t}} | {:error, term}
  def create_account(attrs \\ %{}, %User{email: email} = user) do
    start_transaction()
    |> add_operation(:account, fn _ ->
      %Account{}
      |> Account.changeset(Map.merge(%{name: email}, attrs))
      |> Ecto.Changeset.change(%{root_user_id: user.id})
      |> Core.Repo.insert()
    end)
    |> add_operation(:user, fn %{account: %{id: id}} ->
      user
      |> Ecto.Changeset.change(%{account_id: id})
      |> Core.Repo.update()
    end)
    |> add_operation(:trial, fn %{account: account} ->
      case Payments.trial_exists?() do
        true -> Payments.begin_trial(account)
        _ -> {:ok, nil}
      end
    end)
    |> execute()
  end

  @doc """
  Updates the account of the user if permitted
  """
  @spec update_account(map, User.t) :: account_resp
  def update_account(attributes, %User{account_id: aid} = user) do
    start_transaction()
    |> add_operation(:db, fn _ ->
      get_account!(aid)
      |> Core.Repo.preload([:domain_mappings])
      |> Account.changeset(attributes)
      |> allow(user, :edit)
      |> when_ok(:update)
    end)
    |> add_operation(:stripe, fn
      %{db: %{address_updated: true, billing_customer_id: cid} = account} when is_binary(cid) ->
        account = Core.Repo.preload(account, [:root_user])
        with {:ok, stripe} <- Core.Services.Payments.stripe_attrs(account),
          do: Stripe.Customer.update(cid, stripe)
      %{db: db} -> {:ok, db}
    end)
    |> add_operation(:domain_mappings, fn
      %{db: %Account{domain_mappings: [_ | _] = mappings} = account} ->
        email_domain = User.domain(user)
        case {Enum.all?(mappings, fn %DomainMapping{domain: domain} -> domain == email_domain end), !!user.email_confirmed} do
          {true, false} -> {:error, "you must confirm your email to modify domain mappings"}
          {true, _} -> {:ok, account}
          {_, _} -> {:error, "you cannot create a domain mapping that does not match your email domain"}
        end
      %{db: db} -> {:ok, db}
    end)
    |> execute(extract: :db)
  end

  @doc """
  Adds a domain mapping to an account, for use internally and via MCP
  """
  @spec add_domain_mapping(binary, binary) :: {:ok, DomainMapping.t} | {:error, term}
  def add_domain_mapping(domain, account_id) do
    %DomainMapping{account_id: account_id, domain: domain}
    |> DomainMapping.changeset()
    |> Core.Repo.insert()
  end

  @doc """
  Utility for manually updating account payment information
  """
  @spec update_payments(map, Account.t | User.t | binary) :: account_resp
  def update_payments(attrs, %Account{} = account) do
    Account.changeset(account, attrs)
    |> Core.Repo.update()
  end

  def update_payments(attrs, %User{} = user) do
    %{account: account} = Core.Repo.preload(user, [:account])
    update_payments(attrs, account)
  end

  def update_payments(attrs, email) when is_binary(email),
    do: update_payments(attrs, Users.get_user_by_email!(email))

  @doc """
  Setup stub groups/roles for trialed accounts
  """
  @spec account_setup(User.t) :: {:ok, map} | error
  def account_setup(%User{} = user) do
    start_transaction()
    |> add_operation(:manager, fn _ ->
      create_group(%{
        name: "managers",
        description: "account managers responsible for billing and user management"
      }, user)
    end)
    |> add_operation(:dev, fn _ ->
      create_group(%{
        name: "developers",
        description: "developers able to install/operate applications"
      }, user)
    end)
    |> add_operation(:admin, fn _ ->
      create_group(%{
        name: "admins",
        description: "users with global permissions (can also just toggle the admin switch for this)"
      }, user)
    end)
    |> add_operation(:billing_admin_role, fn tx ->
      create_role(%{
        name: "billing-admins",
        description: "access to billing management",
        bindings: [%{group_id: fetch_group_id(tx, :manager)}],
        permissions: %{billing: true, users: true}
      }, user)
    end)
    |> add_operation(:user_management, fn tx ->
      create_role(%{
        name: "user-management",
        description: "access to billing management",
        bindings: [%{group_id: fetch_group_id(tx, :manager)}],
        permissions: %{users: true}
      }, user)
    end)
    |> add_operation(:admin_role, fn tx ->
      create_role(%{
        name: "admin",
        description: "access to billing management",
        bindings: [%{group_id: fetch_group_id(tx, :admin)}],
        permissions: Role.permissions() |> Enum.into(%{}, & {&1, true})
      }, user)
    end)
    |> add_operation(:developer_role, fn tx ->
      create_role(%{
        name: "developer",
        description: "ability to install and publish applications",
        bindings: [%{group_id: fetch_group_id(tx, :dev)}],
        permissions: %{install: true, support: true, publish: true}
      }, user)
    end)
    |> execute()
  end

  defp fetch_group_id(tx, name) do
    case tx do
      %{^name => %{id: id}} -> id
      _ -> nil
    end
  end

  @doc """
  purges a user from our db for gdpr compliance
  """
  @spec delete_user(binary) :: {:ok, map} | error
  def delete_user(email) do
    user = Users.get_user_by_email!(email) |> Core.Repo.preload([:account])
    start_transaction()
    |> add_operation(:account, fn _ ->
      case user do
        %{account: %{root_user_id: id} = account, id: id} ->
          Ecto.Changeset.change(account, %{root_user_id: nil})
          |> Core.Repo.update()
        _ -> {:ok, nil}
      end
    end)
    |> add_operation(:delete_user, fn _ -> Core.Repo.delete(user) end)
    |> execute()
  end

  @doc """
  self-explanatory
  """
  @spec recompute_usage(Account.t) :: account_resp
  def recompute_usage(%Account{id: id} = account) do
    start_transaction()
    |> add_operation(:usage, fn _ ->
      Account.for_id(id)
      |> Account.usage()
      |> Core.Repo.one()
      |> ok()
    end)
    |> add_operation(:update, fn
      %{usage: %{users: u, clusters: c}} ->
        Ecto.Changeset.change(account, %{user_count: u, cluster_count: c, usage_updated: true})
        |> Core.Repo.update()
      _ -> {:error, "could not compute usage"}
    end)
    |> execute(extract: :update)
  end

  @doc """
  Helper function to simplify sso setup for an account
  """
  @spec enable_sso(binary, binary, User.t) :: account_resp
  def enable_sso(domain, connection_id, %User{} = user) do
    start_transaction()
    |> add_operation(:domain, fn _ ->
      get_domain_mapping(domain)
      |> DomainMapping.changeset(%{enable_sso: true, workos_connection_id: connection_id})
      |> Core.Repo.update()
    end)
    |> add_operation(:account, fn _ ->
      update_account(%{workos_connection_id: connection_id}, user)
    end)
    |> execute(extract: :account)
  end

  @doc """
  Helper function to disable sso for a user's account
  """
  @spec disable_sso(User.t) :: account_resp
  def disable_sso(%User{account_id: aid} = user) do
    start_transaction()
    |> add_operation(:account, fn _ ->
      update_account(%{workos_connection_id: nil}, user)
    end)
    |> add_operation(:mappings, fn _ ->
      DomainMapping.for_account(aid)
      |> Core.Repo.update_all(set: [enable_sso: false, workos_connection_id: nil])
      |> ok()
    end)
    |> execute(extract: :account)
  end

  @doc """
  Creates a new invite for this account
  """
  @spec create_invite(map, User.t) :: invite_resp
  def create_invite(%{email: email} = attributes, %User{account_id: aid} = user) do
    start_transaction()
    |> add_operation(:check, fn _ ->
      case Users.get_user_by_email(email) do
        %User{id: user_id} -> {:ok, user_id}
        _ -> {:ok, nil}
      end
    end)
    |> add_operation(:limit, fn _ ->
      case users_exceeded?(user) do
        true -> {:error, "your account has reached the maximum number of users for its plan, please upgrade your plan"}
        _ -> {:ok, user}
      end
    end)
    |> add_operation(:invite, fn %{check: user_id} ->
      %Invite{account_id: aid, user_id: user_id}
      |> Invite.changeset(attributes)
      |> allow(user, :create)
      |> when_ok(:insert)
    end)
    |> add_operation(:validate, fn %{invite: invite} ->
      with %Invite{groups: [_ | _] = groups} <- Core.Repo.preload(invite, [:groups]),
           true <- Enum.any?(groups, & &1.account_id != aid) do
        {:error, "you cannot invite users to groups in other accounts"}
      else
        _ -> {:ok, invite}
      end
    end)
    |> execute(extract: :invite)
    |> notify(:create, user)
  end

  @doc """
  Determines if a user's account has exceeded the maximum number of users for its plan
  """
  @spec users_exceeded?(User.t | Account.t) :: boolean
  def users_exceeded?(%User{} = user) do
    Repo.preload(user, [account: [subscription: :plan]])
    |> Map.get(:account)
    |> users_exceeded?()
  end

  def users_exceeded?(%Account{} = account) do
    case Repo.preload(account, [subscription: :plan]) do
      %Account{subscription: %PlatformSubscription{plan: %PlatformPlan{maximum_users: max}}} when is_integer(max) ->
        account_users(account) >= max
      _ -> false
    end
  end

  def account_users(%Account{id: aid}) do
    User.for_account(aid)
    |> Repo.aggregate(:count, :id)
  end

  def delete_invite(id, %User{} = user) do
    get_invite!(id)
    |> allow(user, :delete)
    |> when_ok(:delete)
  end

  def delete_invite_by_id(id, %User{} = user) do
    Core.Repo.get!(Invite, id)
    |> allow(user, :delete)
    |> when_ok(:delete)
  end

  @doc """
  Creates a service account for the user's account, which is an assumable identity allowing multiple
  users to share credentials for instance to manage a set of installations
  """
  @spec create_service_account(map, User.t) :: user_resp
  def create_service_account(attrs, %User{account_id: id} = user) do
    start_transaction()
    |> add_operation(:sa, fn _ ->
      %User{account_id: id, service_account: true}
      |> User.service_account_changeset(attrs)
      |> allow(user, :create)
      |> when_ok(:insert)
    end)
    |> add_operation(:account, fn %{sa: %{account_id: aid}} -> {:ok, get_account!(aid)} end)
    |> add_operation(:provision, fn
      %{account: %Account{sa_provisioned: true} = account, sa: sa} -> setup_sa_group(account, sa)
      %{account: account, sa: sa} -> provision_service_account_role(account, sa)
    end)
    |> add_operation(:validate, fn %{sa: %{account_id: aid} = sa} ->
      case Core.Repo.preload(sa, impersonation_policy: :bindings) do
        %{impersonation_policy: %{bindings: bindings}} -> validate_bindings(aid, bindings)
        _ -> {:ok, sa}
      end
    end)
    |> execute(extract: :sa)
    |> Users.notify(:create)
  end

  @sa_group "service-accounts"

  defp provision_service_account_role(%Account{id: aid} = account, %User{} = sa) do
    start_transaction()
    |> add_operation(:group, fn _ -> setup_sa_group(account, sa) end)
    |> add_operation(:role, fn %{group: %{group: g}} ->
      %Role{account_id: aid}
      |> Role.changeset(%{
        name: @sa_group,
        description: "permissions given to service accounts in your account",
        repositories: ["*"],
        permissions: %{install: true},
        role_bindings: [%{group_id: g.id}]
      })
      |> Core.Repo.insert()
    end)
    |> add_operation(:account, fn _ ->
      Account.changeset(account, %{sa_provisioned: true})
      |> Core.Repo.update()
    end)
    |> execute()
  end

  defp setup_sa_group(%Account{id: aid}, %User{id: user_id}) do
    start_transaction()
    |> add_operation(:group, fn _ ->
      case get_group_by_name(aid, @sa_group) do
        %Group{} = g -> {:ok, g}
        _ ->
          %Group{account_id: aid}
          |> Group.changeset(%{name: @sa_group, description: "group managed automatically for all service accounts"})
          |> Core.Repo.insert()
      end
    end)
    |> add_operation(:group_member, fn %{group: group} ->
      %GroupMember{group_id: group.id}
      |> GroupMember.changeset(%{user_id: user_id})
      |> Core.Repo.insert()
    end)
    |> execute()
  end

  @doc """
  Updates a service account
  """
  @spec update_service_account(map, binary, User.t) :: user_resp
  def update_service_account(attrs, id, %User{} = user) do
    case Users.get_user(id) do
      %User{service_account: true} = srv ->
        start_transaction()
        |> add_operation(:access, fn _ ->
          srv
          |> Core.Repo.preload([impersonation_policy: [:bindings]])
          |> allow(user, :impersonate)
        end)
        |> add_operation(:sa, fn %{access: srv} ->
          srv
          |> User.service_account_changeset(attrs)
          |> Core.Repo.update()
        end)
        |> add_operation(:validate, fn %{sa: %{account_id: aid} = sa} ->
          case Core.Repo.preload(sa, impersonation_policy: :bindings) do
            %{impersonation_policy: %{bindings: bindings}} -> validate_bindings(aid, bindings)
            _ -> {:ok, sa}
          end
        end)
        |> execute(extract: :sa)
      _ -> {:error, "not a service account"}
    end
  end

  @doc """
  Authorizes the acting user to impersonate a service account, allowing jwts to be issued for it
  """
  @spec impersonate_service_account(:email | :id, binary, User.t) :: user_resp
  def impersonate_service_account(:email, email, user) do
    Users.get_user_by_email!(email)
    |> impersonate_service_account(user)
  end

  def impersonate_service_account(:id, id, user) do
    Users.get_user(id)
    |> impersonate_service_account(user)
  end

  def impersonate_service_account(%User{} = service_account, %User{} = user),
    do: allow(service_account, user, :impersonate)


  @doc """
  Grabs the license key for a users account
  """
  @spec license_key(User.t) :: {:ok, binary} | {:error, term}
  def license_key(%User{} = user) do
    with {:ent, true} <- {:ent, Payments.enterprise?(user)},
         {:ok, _} <- Payments.allow_billing(user) do
      license_key()
    else
      {:ent, _} -> {:error, "only enterprise accounts can download license keys"}
      err -> err
    end
  end

  def license_key() do
    exp = Timex.now() |> Timex.shift(days: 365) |> Timex.to_unix()
    with {:ok, claims} <- Jwt.generate_claims(%{"enterprise" => true, "exp" => exp}),
         {:ok, token, _} <- Jwt.encode_and_sign(claims, Jwt.signer()),
      do: {:ok, token}
  end

  @doc """
  Fetch all users that can impersonate this service account.  Return just the user if not a service account
  """
  @spec accessible_users(User.t) :: [User.t]
  def accessible_users(%User{service_account: true} = user) do
    User.for_service_account(user)
    |> Core.Repo.all()
  end
  def accessible_users(user), do: [user]

  @doc """
  Accepts the invite and creates a new user
  """
  @spec realize_invite(map, binary) :: user_resp
  def realize_invite(attributes, invite_id) do
    invite = get_invite!(invite_id)
             |> Core.Repo.preload([:groups, :oidc_provider, :service_account, user: :account])

    start_transaction()
    |> add_operation(:user, fn _ ->
      case invite do
        %{user: %User{} = user} -> {:ok, user}
        _ -> {:ok, %User{email: invite.email}}
      end
    end)
    |> add_operation(:upsert, fn %{user: user} ->
      user
      |> User.invite_changeset(Map.merge(attributes, %{email: invite.email, roles: %{admin: invite.admin}}))
      |> Ecto.Changeset.change(%{account_id: invite.account_id})
      |> Core.Repo.insert_or_update()
    end)
    |> add_operation(:limit, fn %{upsert: user} ->
      case Payments.limited?(user, :user) do
        true -> {:error, "your account is over the user limit, contact your administrator to upgrade and try again"}
        _ -> {:ok, user}
      end
    end)
    |> add_operation(:rm_groups, fn %{upsert: upsert} ->
      GroupMember.for_user(upsert.id)
      |> Core.Repo.delete_all()
      |> ok()
    end)
    |> add_to_groups(invite)
    |> add_bindings(:oidc, invite)
    |> add_bindings(:sa, invite)
    |> add_operation(:invite, fn _ -> Core.Repo.delete(invite) end)
    |> add_operation(:account, fn
      %{user: %{id: uid, account: %{root_user_id: uid} = account}} ->
        Ecto.Changeset.change(account, %{root_user_id: nil})
        |> Core.Repo.update()
      %{user: %{account: a}} -> {:ok, a}
    end)
    |> execute(extract: :upsert)
    |> Users.notify(:create)
  end

  defp add_to_groups(xact, %Invite{groups: [_ | _] = groups}) do
    Enum.reduce(groups, xact, fn %Group{id: id}, xact ->
      add_operation(xact, {:group, id}, fn %{upsert: user} ->
        %GroupMember{group_id: id}
        |> GroupMember.changeset(%{user_id: user.id})
        |> Core.Repo.insert()
      end)
    end)
  end
  defp add_to_groups(xact, _), do: xact

  defp add_bindings(xact, :oidc, %Invite{oidc_provider: %OIDCProvider{} = provider}) do
    add_operation(xact, :oidc, fn %{upsert: %{id: id}} ->
      provider = Core.Repo.preload(provider, [:bindings])
      bindings = add_binding(provider.bindings, id)

      OIDCProvider.changeset(provider, %{bindings: bindings})
      |> Core.Repo.update()
    end)
  end
  defp add_bindings(xact, :sa, %Invite{service_account: %User{} = sa}) do
    add_operation(xact, :sa, fn %{upsert: %{id: id}} ->
      sa = Core.Repo.preload(sa, [impersonation_policy: [:bindings]])
      bindings = add_binding(sa.impersonation_policy.bindings, id)

      User.service_account_changeset(sa, %{impersonation_policy: %{bindings: bindings}})
      |> Core.Repo.update()
    end)
  end
  defp add_bindings(xact, _, _), do: xact

  defp add_binding(bindings, user_id) do
    Enum.map([%{user_id: user_id} | bindings], fn
      %{user_id: uid} when is_binary(uid) -> %{user_id: uid}
      %{group_id: gid} when is_binary(gid) -> %{group_id: gid}
    end)
    |> MapSet.new()
    |> MapSet.to_list()
  end

  @doc """
  Creates a group in the user's account
  """
  @spec create_group(map, User.t) :: group_resp
  def create_group(attributes, %User{account_id: aid} = user) do
    start_transaction()
    |> add_operation(:group, fn _ ->
      %Group{account_id: aid}
      |> Group.changeset(attributes)
      |> allow(user, :create)
      |> when_ok(:insert)
    end)
    |> add_operation(:member, fn %{group: %{id: id}} ->
      %GroupMember{group_id: id}
      |> GroupMember.changeset(%{user_id: user.id})
      |> Core.Repo.insert()
    end)
    |> execute(extract: :group)
    |> notify(:create, user)
  end

  @doc """
  Updates group attributes
  """
  @spec update_group(map, binary, User.t) :: group_resp
  def update_group(attributes, group_id, %User{} = user) do
    get_group!(group_id)
    |> Group.changeset(attributes)
    |> allow(user, :update)
    |> when_ok(:update)
    |> notify(:update, user)
  end

  @doc """
  Deletes a group
  """
  @spec delete_group(binary, User.t) :: group_resp
  def delete_group(group_id, %User{} = user) do
    get_group!(group_id)
    |> allow(user, :delete)
    |> when_ok(:delete)
    |> notify(:delete, user)
  end

  @doc """
  Creates a new member in `group_id`
  """
  @spec create_group_member(map, binary, User.t) :: group_member_resp
  def create_group_member(attributes, group_id, %User{} = user) do
    %GroupMember{group_id: group_id}
    |> GroupMember.changeset(attributes)
    |> allow(user, :create)
    |> when_ok(:insert)
    |> notify(:create, user)
  end

  @spec upsert_group_member(binary, binary) :: group_member_resp
  def upsert_group_member(group_id, user_id) do
    case Core.Repo.get_by(GroupMember, user_id: user_id, group_id: group_id) do
      nil -> Core.Repo.insert(%GroupMember{group_id: group_id, user_id: user_id})
      %GroupMember{} = gm -> {:ok, gm}
    end
  end

  @doc """
  low-level group member creation
  """
  @spec create_group_member(binary, binary) :: group_member_resp
  def create_group_member(%User{} = user, group_id) do
    %GroupMember{group_id: group_id}
    |> GroupMember.changeset(%{user_id: user.id})
    |> Core.Repo.insert()
    |> notify(:create, user)
  end

  @doc """
  Deletes a group member by id
  """
  @spec delete_group_member(binary | GroupMember.t, User.t) :: group_member_resp
  def delete_group_member(id, %User{} = user) when is_binary(id) do
    Core.Repo.get!(GroupMember, id)
    |> delete_group_member(user)
  end

  def delete_group_member(%GroupMember{} = member, %User{} = user) do
    member
    |> allow(user, :delete)
    |> when_ok(:delete)
    |> notify(:delete, user)
  end

  @spec delete_group_member(binary, binary, User.t) :: group_member_resp
  def delete_group_member(group_id, user_id, %User{} = user) do
    Core.Repo.get_by!(GroupMember, user_id: user_id, group_id: group_id)
    |> delete_group_member(user)
  end

  @doc """
  Creates a new role in the user's account
  """
  @spec create_role(map, User.t) :: role_resp
  def create_role(attrs, %User{account_id: id} = user) do
    start_transaction()
    |> add_operation(:role, fn _ ->
      %Role{account_id: id}
      |> Role.changeset(attrs)
      |> allow(user, :create)
      |> when_ok(:insert)
    end)
    |> add_operation(:validate, fn
      %{role: %{account_id: aid, role_bindings: role_bindings}} ->
        validate_bindings(aid, role_bindings)
    end)
    |> execute(extract: :role)
    |> notify(:create, user)
  end

  @doc """
  Updates a role by id
  """
  @spec update_role(map, binary, User.t) :: role_resp
  def update_role(attrs, id, %User{} = user) do
    start_transaction()
    |> add_operation(:role, fn _ ->
      get_role!(id)
      |> Core.Repo.preload([:role_bindings])
      |> Role.changeset(attrs)
      |> allow(user, :edit)
      |> when_ok(:update)
    end)
    |> add_operation(:validate, fn
      %{role: %{account_id: aid, role_bindings: role_bindings}} ->
        validate_bindings(aid, role_bindings)
    end)
    |> execute(extract: :role)
    |> notify(:update, user)
  end

  @doc """
  Determines if all bindings are for the relevant account
  """
  @spec validate_bindings(binary, [binding]) :: {:ok, [binding]} | error
  def validate_bindings(account_id, [_ | _] = bindings) do
    bindings
    |> Core.Repo.preload([:user, :group])
    |> Enum.all?(fn
      %{group: %{account_id: ^account_id}} -> true
      %{user: %{account_id: ^account_id}} -> true
      _ -> false
    end)
    |> case do
      true -> {:ok, bindings}
      _ -> {:error, "attempted to bind a user or group not in this account"}
    end
  end
  def validate_bindings(_, bindings), do: {:ok, bindings}

  @doc """
  Deletes a role by id
  """
  @spec delete_role(binary, User.t) :: role_resp
  def delete_role(id, user) do
    get_role!(id)
    |> allow(user, :delete)
    |> when_ok(:delete)
    |> notify(:delete, user)
  end


  @doc """
  Creates a new integration webhook for this account
  """
  @spec create_webhook(map, User.t) :: webhook_resp
  def create_webhook(attrs, %User{account_id: account_id} = user) do
    %IntegrationWebhook{account_id: account_id}
    |> IntegrationWebhook.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
    |> notify(:create, user)
  end

  @doc """
  Updates an integration webhook
  """
  @spec update_webhook(map, binary, User.t) :: webhook_resp
  def update_webhook(attrs, webhook_id, user) do
    get_webhook!(webhook_id)
    |> IntegrationWebhook.changeset(attrs)
    |> allow(user, :edit)
    |> when_ok(:update)
    |> notify(:update, user)
  end

  @doc """
  Deletes an integration webhook
  """
  @spec delete_webhook(binary, User.t) :: webhook_resp
  def delete_webhook(webhook_id, user) do
    get_webhook!(webhook_id)
    |> allow(user, :edit)
    |> when_ok(:delete)
    |> notify(:delete, user)
  end

  @doc """
  Makes a signed http POST to the given webhook url, with the payload:
  """
  @spec post_webhook(map, IntegrationWebhook.t) :: {:ok, %HTTPoison.Response{}} | {:error, term}
  def post_webhook(message, %IntegrationWebhook{url: url, secret: secret}) do
    time      = :os.system_time(:millisecond)
    payload   = Jason.encode!(message)
    signature = hmac(secret, "#{payload}\n#{time}")

    headers   = [
      {"content-type", "application/json"},
      {"accept", "application/json"},
      {"x-forge-signature", "sha1=#{signature}"},
      {"x-forge-timestamp", "#{time}"}
    ]
    HTTPoison.post(url, payload, headers)
  end

  def hmac(secret, payload) when is_binary(payload) do
    :crypto.mac(:hmac, :sha, secret, payload)
    |> Base.encode16(case: :lower)
  end

  def create_oauth_integration(%{code: code, redirect_uri: redirect} = args, %User{} = user) do
    start_transaction()
    |> add_operation(:base, fn _ ->
      %OAuthIntegration{account_id: user.account_id}
      |> OAuthIntegration.changeset(args)
      |> allow(user, :create)
      |> when_ok(:insert)
    end)
    |> add_operation(:oauth, fn %{base: %{service: service}} -> create_token(service, code, redirect) end)
    |> add_operation(:finished, fn %{base: base, oauth: response} -> apply_oauth(base, response) end)
    |> execute(extract: :finished)
  end

  def create_zoom_meeting(%{topic: topic} = args, %User{account_id: account_id, email: email} = user) do
    password = Core.Password.generate()

    get_oauth_integration!(:zoom, account_id)
    |> maybe_refresh()
    |> Core.Clients.Zoom.create_meeting(topic, email, password)
    |> when_ok(fn %{"join_url" => join} ->
      {:ok, %{join_url: join, password: password, incident_id: args[:incident_id]}}
    end)
    |> notify(:zoom, user)
  end

  def maybe_refresh(%OAuthIntegration{service: service, refresh_token: rt, expires_at: expiry} = oauth) do
    case Timex.after?(Timex.now(), expiry) do
      true ->
        {:ok, refresh} = refresh_token(service, rt)
        {:ok, oauth} = apply_oauth(oauth, refresh)
        oauth
      false -> oauth
    end
  end

  defp apply_oauth(%OAuthIntegration{} = oauth, %{"access_token" => at, "refresh_token" => rt, "expires_in" => expiry}) do
    oauth
    |> OAuthIntegration.changeset(%{
      access_token: at,
      refresh_token: rt,
      expires_at: Timex.shift(Timex.now(), seconds: expiry)
    })
    |> Core.Repo.update()
  end

  defp create_token(:zoom, code, redirect), do: Core.Clients.Zoom.create_token(code, redirect)

  defp refresh_token(:zoom, refresh), do: Core.Clients.Zoom.refresh_token(refresh)

  defp notify({:ok, %Group{} = g}, :create, user),
    do: handle_notify(PubSub.GroupCreated, g, actor: user)
  defp notify({:ok, %Group{} = g}, :update, user),
    do: handle_notify(PubSub.GroupUpdated, g, actor: user)
  defp notify({:ok, %Group{} = g}, :delete, user),
    do: handle_notify(PubSub.GroupDeleted, g, actor: user)

  defp notify({:ok, %Role{} = g}, :create, user),
    do: handle_notify(PubSub.RoleCreated, g, actor: user)
  defp notify({:ok, %Role{} = g}, :update, user),
    do: handle_notify(PubSub.RoleUpdated, g, actor: user)
  defp notify({:ok, %Role{} = g}, :delete, user),
    do: handle_notify(PubSub.RoleDeleted, g, actor: user)

  defp notify({:ok, %IntegrationWebhook{} = g}, :create, user),
    do: handle_notify(PubSub.IntegrationWebhookCreated, g, actor: user)
  defp notify({:ok, %IntegrationWebhook{} = g}, :update, user),
    do: handle_notify(PubSub.IntegrationWebhookUpdated, g, actor: user)
  defp notify({:ok, %IntegrationWebhook{} = g}, :delete, user),
    do: handle_notify(PubSub.IntegrationWebhookDeleted, g, actor: user)

  defp notify({:ok, %GroupMember{} = m}, :create, user),
    do: handle_notify(PubSub.GroupMemberCreated, m, actor: user)
  defp notify({:ok, %GroupMember{} = m}, :delete, user),
    do: handle_notify(PubSub.GroupMemberDeleted, m, actor: user)


  defp notify({:ok, %Invite{} = inv}, :create, user),
    do: handle_notify(PubSub.InviteCreated, inv, actor: user)

  defp notify({:ok, meeting}, :zoom, user),
    do: handle_notify(PubSub.ZoomMeetingCreated, meeting, actor: user)

  defp notify(pass, _, _), do: pass
end
