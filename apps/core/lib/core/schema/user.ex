defmodule Core.Schema.User do
  use Piazza.Ecto.Schema, derive_json: false
  use Arc.Ecto.Schema
  alias Core.Schema.{
    Address,
    Publisher,
    Webhook,
    Account,
    Group,
    RoleBinding,
    Incident,
    ImpersonationPolicy,
    GroupMember,
    Role,
    DemoProject,
    Invite,
    OIDCTrustRelationship
  }

  @email_re ~r/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-\.]+\.[a-zA-Z]{2,}$/

  defenum LoginMethod,
    password: 0,
    passwordless: 1,
    google: 2,
    github: 3,
    sso: 4

  defenum OnboardingStatus,
    new: 0,
    onboarded: 1,
    installed: 2,
    active: 3

  defenum OnboardingChecklistStatus,
    new: 0,
    configured: 1,
    console_installed: 2,
    finished: 3

  schema "users" do
    field :name,            :string
    field :email,           :string
    field :email_changed,   :boolean, virtual: true
    field :login_method,    LoginMethod, default: :password
    field :onboarding,      OnboardingStatus, default: :new
    field :password_hash,   :string
    field :password,        :string, virtual: true
    field :jwt,             :string, virtual: true
    field :external,        :boolean, virtual: true, default: false
    field :service_account, :boolean, default: false
    field :demoed,          :boolean, default: false
    field :avatar_id,       :binary_id
    field :avatar,          Core.Storage.Type
    field :provider,        Core.Schema.Dependencies.Provider
    field :customer_id,     :string
    field :phone,           :string
    field :external_id,     :string
    field :demo_count,      :integer, default: 0
    field :upgrade_to,      :binary_id
    field :trusted_icon,    :boolean, default: false, virtual: true
    field :password_change, :boolean, default: false, virtual: true

    field :email_confirmed,  :boolean, default: false
    field :email_confirm_by, :utc_datetime_usec

    embeds_one :address, Address, on_replace: :update
    embeds_one :roles, Roles, on_replace: :update do
      boolean_fields [:admin]
    end

    embeds_one :onboarding_checklist, OnboardingChecklist, on_replace: :update do
      field :status,    OnboardingChecklistStatus, default: :new
      field :dismissed, :boolean, default: false
    end

    belongs_to :account, Account

    has_one :publisher,  Publisher, foreign_key: :owner_id
    has_one :impersonation_policy, ImpersonationPolicy, on_replace: :delete
    has_one :demo_project, DemoProject

    has_many :invites, Invite, foreign_key: :service_account_id
    has_many :webhooks,  Webhook
    has_many :trust_relationships, OIDCTrustRelationship
    has_many :role_bindings, RoleBinding
    many_to_many :groups, Group, join_through: "group_members"
    has_many :group_role_bindings, through: [:groups, :role_bindings]

    timestamps()
  end

  def domain(%__MODULE__{email: email}) do
    case String.split(email, "@") do
      [_, domain] -> domain
      _ -> nil
    end
  end

  def mark_url_safe(), do: Process.put({__MODULE__, :url_safe}, true)

  def url_safe?(), do: !!Process.get({__MODULE__, :url_safe})

  def intercom_id(%__MODULE__{id: id}), do: Core.sha("#{id}:#{Core.conf(:intercom_salt)}")

  def service_account(query \\ __MODULE__, is_svc \\ :yes)

  def service_account(query, :yes) do
    from(u in query, where: u.service_account)
  end

  def service_account(query, _) do
    from(u in query, where: not u.service_account)
  end

  def roles(%__MODULE__{role_bindings: roles, group_role_bindings: group_roles})
    when is_list(roles) and is_list(group_roles) do
    Enum.map(roles ++ group_roles, & &1.role)
    |> Enum.uniq_by(& &1.id)
  end
  def roles(_), do: []

  def for_role(query \\ __MODULE__, %Role{} = role) do
    %{role_bindings: bindings} = Core.Repo.preload(role, [:role_bindings])
    for_bindings(query, bindings)
  end

  def for_service_account(query \\ __MODULE__, user)
  def for_service_account(query, %__MODULE__{service_account: true} = user) do
    case Core.Repo.preload(user, [impersonation_policy: :bindings]) do
      %{impersonation_policy: %{bindings: [_ | _] = bindings}} -> for_bindings(query, bindings)
      _ -> for_bindings(query, [])
    end
  end
  def for_service_account(query, _), do: for_bindings(query, [])

  def accessible(query \\ __MODULE__, %__MODULE__{id: user_id, groups: groups}) do
    group_ids = Enum.map(groups, & &1.id)

    from(u in query,
      join: p in assoc(u, :impersonation_policy),
      join: b in assoc(p, :bindings),
      where: b.group_id in ^group_ids or b.user_id == ^user_id,
      distinct: true
    )
  end

  defp for_bindings(query, bindings) do
    user_ids  = Enum.filter(bindings, & &1.user_id) |> Enum.map(& &1.user_id)
    group_ids = Enum.filter(bindings, & &1.group_id) |> Enum.map(& &1.group_id)

    from(u in query,
      left_join: g in assoc(u, :groups),
      where: u.id in ^user_ids or g.id in ^group_ids,
      distinct: true
    )
  end

  def search(query \\ __MODULE__, name) do
    from(u in query, where: ilike(u.name, ^"%#{name}%") or ilike(u.email, ^"%#{name}%"))
  end

  def for_account(query \\ __MODULE__, account_id) do
    from(u in query, where: u.account_id == ^account_id)
  end

  def for_emails(query \\ __MODULE__, emails) do
    from(u in query, where: u.email in ^emails)
  end

  def not_member(query \\ __MODULE__, group_id) do
    groups = GroupMember.for_group(group_id)
    from(u in query,
      left_join: gm in ^groups, on: gm.user_id == u.id,
      where: is_nil(gm.id)
    )
  end

  def without_account(query \\ __MODULE__) do
    from(u in query, where: is_nil(u.account_id))
  end

  def with_waterline(query \\ __MODULE__) do
    from(u in query, where: not is_nil(u.upgrade_to))
  end

  def for_incident(query \\ __MODULE__, %Incident{creator: %{account_id: id1}, owner: %{account_id: id2}}) do
    from(u in query, where: u.account_id in ^[id1, id2])
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(p in query, order_by: ^order)

  @valid ~w(name email password phone login_method demoed demo_count trusted_icon onboarding)a
  @secondary Enum.filter(@valid, & &1 not in [:password, :email])

  def changeset(model, attrs \\ %{}, mode \\ :primary) do
    model
    |> base_changeset(attrs, mode)
    |> cast_embed(:address)
    |> cast_embed(:roles, with: &roles_changeset/2)
    |> cast_embed(:onboarding_checklist, with: &onboarding_checklist_changeset/2)
  end

  def invite_changeset(model, attrs \\ %{}) do
    base_changeset(model, attrs, :primary)
    |> cast_embed(:roles, with: &roles_changeset/2)
  end

  def base_changeset(model, attrs, mode) do
    model
    |> cast(attrs, fields(mode))
    |> unique_constraint(:email)
    |> unique_constraint(:external_id)
    |> validate_required([:name, :email])
    |> validate_length(:email,    max: 255)
    |> validate_length(:name,     max: 255)
    |> validate_length(:password, min: 10, max: 255)
    |> validate_format(:email, @email_re)
    |> hash_password()
    |> generate_uuid(:avatar_id)
    |> change_markers(password_hash: :password_change)
    |> cast_attachments(attrs, [:avatar], (if url_safe?(), do: [allow_urls: true], else: []))
    |> set_email_changed()
    |> reject_passwordless()
  end

  def reject_passwordless(cs) do
    case get_change(cs, :login_method) do
      :passwordless -> add_error(cs, :login_method, "passwordless logins have been deprecated")
      _ -> cs
    end
  end

  def set_email_changed(cs) do
    confirm_by = Timex.now() |> Timex.shift(days: 7)

    case get_change(cs, :email) do
      email when is_binary(email) ->
        put_change(cs, :email_changed, true)
        |> put_change(:email_confirmed, false)
        |> put_change(:email_confirm_by, confirm_by)
      _ -> put_change(cs, :email_changed, false)
    end
  end

  defp fields(:secondary), do: @secondary
  defp fields(_), do: @valid

  def roles_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, [:admin])
  end

  def onboarding_checklist_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, [:status, :dismissed])
  end

  def service_account_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, [:name, :email])
    |> cast_assoc(:impersonation_policy)
    |> add_name(model)
    |> add_email(model)
    |> validate_length(:email,    max: 255)
    |> validate_length(:name,     max: 255)
    |> validate_length(:password, min: 10, max: 255)
    |> validate_format(:email, @email_re)
    |> unique_constraint(:email)
    |> validate_required([:name, :email])
    |> hash_password()
  end

  defp add_name(changeset, %__MODULE__{name: nil}) do
    put_new_change(changeset, :name, fn -> Core.random_phrase(3) end)
  end
  defp add_name(changeset, _), do: changeset

  defp add_email(changeset, %__MODULE__{email: nil}) do
    name = get_field(changeset, :name)
    changeset
    |> put_new_change(:email, fn -> "#{srv_acct_name(name)}@srv.plural.sh" end)
    |> put_change(:password, srv_acct_pwd())
  end
  defp add_email(changeset, _), do: changeset

  defp srv_acct_name(name) do
    name
    |> String.downcase()
    |> String.replace(" ", ".")
  end

  defp srv_acct_pwd() do
    :crypto.strong_rand_bytes(64)
    |> Base.url_encode64()
  end

  @stripe_valid ~w(customer_id)a

  def stripe_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @stripe_valid)
    |> unique_constraint(:customer_id)
  end

  defp hash_password(%Ecto.Changeset{valid?: true, changes: %{password: password}} = changeset) do
    change(changeset, Argon2.add_hash(password))
  end
  defp hash_password(changeset), do: changeset
end

defimpl Jason.Encoder, for: Core.Schema.User do
  @ignore ~w(password password_hash jwt onboarding_checklist)a

  def encode(struct, opts) do
    Piazza.Ecto.Schema.mapify(struct)
    |> Map.drop(@ignore)
    |> Jason.Encode.map(opts)
  end
end
