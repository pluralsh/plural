defmodule Core.Services.AccountsTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.PubSub
  alias Core.Services.Accounts
  alias Core.Auth.Jwt

  describe "#create_service_account/2" do
    setup [:setup_root_user]

    test "root users can create service account", %{user: user} do
      group = insert(:group, account: user.account)

      {:ok, srv_acct} = Accounts.create_service_account(%{
        name: "service account",
        impersonation_policy: %{bindings: [%{group_id: group.id}]}
      }, user)

      assert srv_acct.service_account
      assert srv_acct.email == "service.account@srv.plural.sh"
      assert srv_acct.name == "service account"
      %{bindings: [binding]} = srv_acct.impersonation_policy

      assert binding.group_id == group.id

      %{groups: [group], group_role_bindings: [%{role: role}]} = Core.Services.Rbac.preload(srv_acct)

      assert group.name == "service-accounts"
      assert group.account_id == srv_acct.account_id
      assert role.name == "service-accounts"
      assert role.permissions.install

      assert refetch(user.account).sa_provisioned

      assert_receive {:event, %PubSub.UserCreated{item: ^srv_acct}}
    end

    test "cannot bind to groups in other accounts", %{user: user} do
      group = insert(:group)

      {:error, _} = Accounts.create_service_account(%{
        name: "service account",
        impersonation_policy: %{bindings: [%{group_id: group.id}]}
      }, user)
    end

    test "you can manually specify service account emails", %{user: user} do
      group = insert(:group, account: user.account)

      {:ok, srv_acct} = Accounts.create_service_account(%{
        name: "service account",
        email: "someone@example.com",
        impersonation_policy: %{bindings: [%{group_id: group.id}]}
      }, user)

      assert srv_acct.service_account
      assert srv_acct.email == "someone@example.com"
      assert srv_acct.name == "service account"
    end
  end

  describe "#update_service_account/2" do
    setup [:setup_root_user]

    test "root users can update service accounts", %{user: user} do
      srv = insert(:user, service_account: true, account: user.account)
      group = insert(:group, account: user.account)

      {:ok, srv_acct} = Accounts.update_service_account(%{
        name: "service account",
        impersonation_policy: %{bindings: [%{group_id: group.id}]}
      }, srv.id, user)

      assert srv_acct.id == srv.id
      assert srv_acct.email == srv.email
      assert srv_acct.name == "service account"
      %{bindings: [binding]} = srv_acct.impersonation_policy

      assert binding.group_id == group.id
    end

    test "non-writers cannot add themselves", %{account: account} do
      user = insert(:user, account: account)
      srv = insert(:user, service_account: true, account: account)

      {:error, _} = Accounts.update_service_account(%{
        name: "service account",
        impersonation_policy: %{bindings: [%{user_id: user.id}]}
      }, srv.id, user)
    end

    test "non service accts cannot be updated", %{user: user} do
      srv = insert(:user, account: user.account)
      group = insert(:group, account: user.account)

      {:error, _} = Accounts.update_service_account(%{
        name: "service account",
        impersonation_policy: %{bindings: [%{group_id: group.id}]}
      }, srv.id, user)
    end
  end

  describe "#impersonate_service_account/3" do
    test "you can assume a service account with a matching policy" do
      user = insert(:user)
      sa = insert(:user, service_account: true, account: user.account)
      %{group: group} = insert(:impersonation_policy_binding,
        policy: build(:impersonation_policy, user: sa),
        group: insert(:group, account: user.account)
      )
      insert(:group_member, group: group, user: user)

      {:ok, imp} = Accounts.impersonate_service_account(:email, sa.email, user)

      assert imp.id == sa.id
    end

    test "admins can assume a service account even without a matching policy" do
      account = insert(:account)
      user = admin_user(account)
      sa = insert(:user, service_account: true, account: account)

      {:ok, imp} = Accounts.impersonate_service_account(:email, sa.email, user)

      assert imp.id == sa.id
    end

    test "root users can assume a service account without being on a policy" do
      user = insert(:user)
      {:ok, %{user: user, account: account}} = Core.Services.Accounts.create_account(user)
      sa = insert(:user, service_account: true, account: account)
      user = Core.Repo.preload(user, [:account], force: true)

      {:ok, imp} = Accounts.impersonate_service_account(:email, sa.email, user)

      assert imp.id == sa.id
    end

    test "you cannot assume if the policy doesn't match" do
      user = insert(:user)
      sa = insert(:user, service_account: true, account: user.account)
      insert(:impersonation_policy_binding,
        policy: build(:impersonation_policy, user: sa),
        group: insert(:group, account: user.account)
      )

      {:error, _} = Accounts.impersonate_service_account(:email, sa.email, user)
    end
  end

  describe "#update_account/2" do
    setup [:setup_root_user]

    test "Root users can update accounts", %{user: user} do
      {:ok, account} = Accounts.update_account(%{name: "updated"}, user)

      assert account.name == "updated"
    end

    test "cannot put urls in names", %{user: user} do
      {:error, _} = Accounts.update_account(%{name: "https://evil.com"}, user)
    end

    test "if billing address is updated, it will update the stripe customer", %{user: user, account: account} do
      {:ok, _} = update_record(account, %{billing_customer_id: "strp"})
      me = self()
      expect(Stripe.Customer, :update, fn "strp", %{address: address, name: name} ->
        send me, {:stripe, address, name}
        {:ok, %{}}
      end)

      {:ok, upd} = Accounts.update_account(%{
        billing_address: %{
          line1: "line1",
          line2: "line2",
          city: "new york",
          state: "ny",
          country: "us",
          zip: "10023",
          name: "me"
        }
      }, user)

      assert_receive {:stripe, address, name}
      assert upd.id == account.id
      assert name == "me"
      assert address.line1 == upd.billing_address.line1
      assert address.line2 == upd.billing_address.line2
      assert address.city == upd.billing_address.city
      assert address.state == upd.billing_address.state
      assert address.country == upd.billing_address.country
      assert address.postal_code == upd.billing_address.zip
    end

    test "account admins can update accounts", %{user: user} do
      admin = insert(:user, account: user.account, roles: %{admin: true})

      {:ok, account} = Accounts.update_account(%{name: "updated"}, admin)

      assert account.name == "updated"
    end

    test "users cannot update domain mappings if emails are unconfirmed", %{user: user} do
      admin = insert(:user, account: user.account, roles: %{admin: true})

      {:error, _} = Accounts.update_account(%{
        domain_mappings: [%{"domain" => "example.com"}]
      }, admin)
    end
  end

  describe "#create_group/2" do
    setup [:setup_root_user]

    test "root users can create groups", %{user: user, account: account} do
      {:ok, group} = Accounts.create_group(%{name: "group"}, user)

      assert group.account_id == account.id
      assert group.name == "group"
      assert Accounts.get_group_member(group.id, user.id)

      assert_receive {:event, %PubSub.GroupCreated{item: ^group, actor: ^user}}
    end

    test "admins can create groups", %{account: account} do
      admin = insert(:user, account: account, roles: %{admin: true})
      {:ok, group} = Accounts.create_group(%{name: "group"}, admin)

      assert group.account_id == account.id
      assert group.name == "group"
      assert Accounts.get_group_member(group.id, admin.id)

      assert_receive {:event, %PubSub.GroupCreated{item: ^group, actor: ^admin}}
    end

    test "random users cannot create groups", %{account: account} do
      {:error, _} = Accounts.create_group(%{name: "group"}, insert(:user, account: account))
    end
  end

  describe "#update_group/3" do
    setup [:setup_root_user]

    test "root users can update groups", %{user: user, account: account} do
      group = insert(:group, account: account)
      {:ok, updated} = Accounts.update_group(%{name: "updated"}, group.id, user)

      assert updated.id == group.id
      assert updated.name == "updated"

      assert_receive {:event, %PubSub.GroupUpdated{item: ^updated, actor: ^user}}
    end

    test "if global is updated, the group is marked globalized", %{user: user, account: account} do
      group = insert(:group, account: account)
      {:ok, updated} = Accounts.update_group(%{name: "updated", global: true}, group.id, user)

      assert updated.id == group.id
      assert updated.name == "updated"
      assert updated.global
      assert updated.globalized

      assert_receive {:event, %PubSub.GroupUpdated{item: ^updated, actor: ^user}}
    end

    test "nonroot users cannot update groups", %{account: account} do
      group = insert(:group, account: account)
      {:error, _} = Accounts.update_group(%{name: "updated"}, group.id, insert(:user, account: account))
    end
  end

  describe "#delete_group/2" do
    setup [:setup_root_user]

    test "root users can delete groups", %{user: user, account: account} do
      group = insert(:group, account: account)
      {:ok, deleted} = Accounts.delete_group(group.id, user)

      assert deleted.id == group.id
      refute refetch(group)

      assert_receive {:event, %PubSub.GroupDeleted{item: ^deleted, actor: ^user}}
    end

    test "nonroot users cannot delete groups", %{account: account} do
      group = insert(:group, account: account)
      {:error, _} = Accounts.delete_group(group.id, insert(:user, account: account))
    end
  end

  describe "#create_group_member/3" do
    setup [:setup_root_user]

    test "root users can create group members", %{user: user, account: account} do
      group = insert(:group, account: account)
      other = insert(:user, account: account)
      {:ok, gm} = Accounts.create_group_member(%{user_id: other.id}, group.id, user)

      assert gm.group_id == group.id
      assert gm.user_id == other.id

      assert_receive {:event, %PubSub.GroupMemberCreated{item: ^gm, actor: ^user}}
    end

    test "users must be same account", %{user: user, account: account} do
      group = insert(:group, account: account)
      other = insert(:user)
      {:error, _} = Accounts.create_group_member(%{user_id: other.id}, group.id, user)
    end

    test "nonroot users cannot create group members", %{account: account} do
      group = insert(:group, account: account)
      other = insert(:user, account: account)
      {:error, _} = Accounts.create_group_member(%{user_id: other.id}, group.id, insert(:user, account: account))
    end
  end

  describe "#delete_group_member/3" do
    setup [:setup_root_user]

    test "root users can create group members", %{user: user, account: account} do
      group = insert(:group, account: account)
      member = insert(:group_member, group: group)
      {:ok, gm} = Accounts.delete_group_member(member.id, user)

      refute refetch(gm)

      assert_receive {:event, %PubSub.GroupMemberDeleted{item: ^gm, actor: ^user}}
    end

    test "nonroot users cannot create group members", %{account: account} do
      group = insert(:group, account: account)
      member = insert(:group_member, group: group)
      {:error, _} = Accounts.delete_group_member(member.id, insert(:user, account: account))
    end
  end

  describe "#create_invite/2" do
    setup [:setup_root_user]

    test "root users can create group members", %{user: user, account: account} do
      {:ok, invite} = Accounts.create_invite(%{email: "some@example.com"}, user)

      assert invite.email == "some@example.com"
      assert invite.secure_id
      assert invite.account_id == account.id
    end

    test "you can invite users into an accounts groups", %{user: user, account: account} do
      group = insert(:group, account: account)
      {:ok, invite} = Accounts.create_invite(%{
        email: "some@example.com",
        invite_groups: [%{group_id: group.id}]
      }, user)

      assert invite.email == "some@example.com"
      assert invite.secure_id
      assert invite.account_id == account.id

      %{groups: [%{id: id}]} = Core.Repo.preload(invite, [:groups])
      assert id == group.id
    end

    test "you cannot invite users into another account's groups", %{user: user} do
      group = insert(:group)
      {:error, _} = Accounts.create_invite(%{
        email: "some@example.com",
        invite_groups: [%{group_id: group.id}]
      }, user)
    end

    test "you cannot invite users if your account has reached the maximum number of users for its plan", %{user: user, account: account} do
      plan = insert(:platform_plan, maximum_users: 1)
      insert(:platform_subscription, account: account, plan: plan)
      {:error, _} = Accounts.create_invite(%{email: "some@example.com"}, user)
    end

    test "it will not accept invalid emails", %{user: user} do
      {:error, _} = Accounts.create_invite(%{email: "invalidemail"}, user)
    end

    test "you can create invites for existing users", %{user: admin} do
      user = insert(:user)
      {:ok, invite} = Accounts.create_invite(%{email: user.email}, admin)

      assert invite.user_id == user.id
    end

    test "nonroot users cannot create group members", %{account: account} do
      {:error, _} = Accounts.create_invite(%{email: "some@example.com"}, insert(:user, account: account))
    end
  end

  describe "#delete_invite/2" do
    setup [:setup_root_user]

    test "root users can delete invites", %{user: user} do
      {:ok, invite} = Accounts.create_invite(%{email: "some@example.com"}, user)
      {:ok, del} = Accounts.delete_invite(invite.secure_id, user)

      assert invite.id == del.id
      refute refetch(invite)
    end
  end

  describe "#realize_invite/3" do
    setup [:setup_root_user]

    test "it can accept invites by secure id", %{user: user, account: account} do
      {:ok, invite} = Accounts.create_invite(%{email: "some@example.com"}, user)

      {:ok, user} = Accounts.realize_invite(%{
        password: "some long password",
        name: "Some User"
      }, invite.secure_id)

      assert user.email == invite.email
      assert user.account_id == account.id
      assert user.name == "Some User"

      assert_receive {:event, %PubSub.UserCreated{item: ^user}}
    end

    test "it can mark admins if selected", %{user: user, account: account} do
      {:ok, invite} = Accounts.create_invite(%{email: "some@example.com", admin: true}, user)

      {:ok, user} = Accounts.realize_invite(%{
        password: "some long password",
        name: "Some User"
      }, invite.secure_id)

      assert user.email == invite.email
      assert user.account_id == account.id
      assert user.name == "Some User"
      assert user.roles.admin

      assert_receive {:event, %PubSub.UserCreated{item: ^user}}
    end

    test "it can bind users to service accounts/oidc providers", %{user: user, account: account} do
      oidc = insert(:oidc_provider)
      sa = insert(:user, service_account: true, account: account)
      group = insert(:group, account: account)
      insert(:oidc_provider_binding, provider: oidc, group: group)
      policy = insert(:impersonation_policy, user: sa)
      insert(:impersonation_policy_binding, policy: policy, group: group)

      {:ok, invite} = Accounts.create_invite(%{
        email: "someone@example.com",
        oidc_provider_id: oidc.id,
        service_account_id: sa.id
      }, user)

      {:ok, new_user} = Accounts.realize_invite(%{
        password: "some long password",
        name: "Some User"
      }, invite.secure_id)

      %{bindings: bindings} = Core.Repo.preload(oidc, [:bindings])
      assert Enum.find_value(bindings, & &1.group_id) == group.id
      assert Enum.find_value(bindings, & &1.user_id) == new_user.id

      %{impersonation_policy: %{bindings: bindings}} = Core.Repo.preload(sa, [impersonation_policy: :bindings])
      assert Enum.find_value(bindings, & &1.group_id) == group.id
      assert Enum.find_value(bindings, & &1.user_id) == new_user.id
    end

    test "it can bind users to groups when realizing an invite", %{user: user, account: account} do
      groups = insert_list(2, :group, account: account)
      {:ok, invite} = Accounts.create_invite(%{
        email: "some@example.com",
        invite_groups: Enum.map(groups, & %{group_id: &1.id}),
      }, user)

      {:ok, user} = Accounts.realize_invite(%{
        password: "some long password",
        name: "Some User"
      }, invite.secure_id)

      assert user.email == invite.email
      assert user.account_id == account.id
      assert user.name == "Some User"

      for g <- groups do
        assert member?(user, g)
      end
    end

    test "Existing root users will have account de-rooted", %{user: user, account: account} do
      %{user: root, account: a2} = setup_root_user([]) |> Map.new()
      gm = insert(:group_member, user: root, group: build(:group, account: a2))
      {:ok, invite} = Accounts.create_invite(%{email: root.email}, user)

      {:ok, user} = Accounts.realize_invite(%{
        password: "some long password",
        name: "Some User"
      }, invite.secure_id)

      assert user.email == invite.email
      assert user.account_id == account.id
      assert user.name == "Some User"

      refute refetch(a2).root_user_id
      refute member?(root, gm.group)
    end

    test "it will ignore privileged fields", %{user: user, account: account} do
      {:ok, invite} = Accounts.create_invite(%{email: "some@example.com"}, user)

      {:ok, user} = Accounts.realize_invite(%{
        password: "some long password",
        name: "Some User",
        roles: %{admin: true}
      }, invite.secure_id)

      assert user.email == invite.email
      assert user.account_id == account.id
      assert user.name == "Some User"
      refute user.roles.admin

      assert_receive {:event, %PubSub.UserCreated{item: ^user}}
    end

    test "it will block realizing invites on user limit", %{user: user, account: account} do
      {:ok, invite} = Accounts.create_invite(%{email: "some@example.com"}, user)
      {:ok, _} = update_record(account, %{user_count: 5})

      {:error, _} = Accounts.realize_invite(%{
        password: "some long password",
        name: "Some User",
        roles: %{admin: true}
      }, invite.secure_id)
    end
  end

  describe "#create_role/2" do
    setup [:setup_root_user]

    test "Root users can create roles", %{user: user, account: account} do
      group = insert(:group, account: account)
      {:ok, role} = Accounts.create_role(%{
        name: "role",
        role_bindings: [%{user_id: user.id}, %{group_id: group.id}],
        permissions: %{billing: true}
      }, user)

      assert role.name == "role"
      assert role.permissions.billing
      assert role.account_id == account.id

      [first, second] = role.role_bindings
      assert first.user_id == user.id
      assert second.group_id == group.id

      assert_receive {:event, %PubSub.RoleCreated{item: ^role, actor: ^user}}
    end

    test "you can't bind to groups in other accounts", %{user: user} do
      group = insert(:group)
      {:error, _} = Accounts.create_role(%{
        name: "role",
        role_bindings: [%{user_id: user.id}, %{group_id: group.id}],
        permissions: %{billing: true}
      }, user)
    end

    test "random users cannot create roles", %{account: account} do
      group = insert(:group)
      user = insert(:user, account: account)

      {:error, _} = Accounts.create_role(%{
        name: "role",
        role_bindings: [%{user_id: user.id}, %{group_id: group.id}],
        permissions: %{billing: true}
      }, user)
    end
  end

  describe "#update_role/3" do
    setup [:setup_root_user]

    test "root users can update roles", %{user: user, account: account} do
      role = insert(:role, account: account)
      {:ok, updated} = Accounts.update_role(%{name: "updated"}, role.id, user)

      assert updated.id == role.id
      assert updated.name == "updated"

      assert_receive {:event, %PubSub.RoleUpdated{item: ^updated, actor: ^user}}
    end

    test "random users cannot update", %{account: account} do
      role = insert(:role, account: account)
      {:error, _} = Accounts.update_role(%{name: "updated"}, role.id, insert(:user))
    end
  end

  describe "#delete_role/2" do
    setup [:setup_root_user]

    test "it can delete a role", %{user: user, account: account} do
      role = insert(:role, account: account)
      {:ok, del} = Accounts.delete_role(role.id, user)

      refute refetch(role)

      assert_receive {:event, %PubSub.RoleDeleted{item: ^del, actor: ^user}}
    end

    test "random users cannot delete a role", %{account: account} do
      role = insert(:role, account: account)
      {:error, _} = Accounts.delete_role(role.id, insert(:user))
    end
  end

  describe "#create_webhook/2" do
    setup [:setup_root_user]

    test "root users can create webhooks", %{user: user} do
      {:ok, webhook} = Accounts.create_webhook(%{
        name: "webhook",
        url: "https://example.com",
        actions: ["incident.create"]
      }, user)

      assert webhook.account_id == user.account_id
      assert webhook.name == "webhook"
      assert webhook.url == "https://example.com"
      assert webhook.actions == ["incident.create"]

      assert_receive {:event, %PubSub.IntegrationWebhookCreated{item: ^webhook, actor: ^user}}
    end

    test "nonprivileged users cannot create", %{account: account} do
      user = insert(:user, account: account)

      {:error, _} = Accounts.create_webhook(%{
        name: "webhook",
        url: "https://example.com",
        actions: ["incident.create"]
      }, user)
    end
  end

  describe "#update_webhook/3" do
    setup [:setup_root_user]

    test "root users can update webhooks", %{user: user} do
      webhook = insert(:integration_webhook, account: user.account)
      {:ok, updated} = Accounts.update_webhook(%{
        name: "webhook",
        url: "https://example.com",
        actions: ["incident.create", "incident.update"]
      }, webhook.id, user)

      assert updated.id == webhook.id
      assert updated.account_id == user.account_id
      assert updated.name == "webhook"
      assert updated.url == "https://example.com"
      assert updated.actions == ["incident.create", "incident.update"]

      assert_receive {:event, %PubSub.IntegrationWebhookUpdated{item: ^updated, actor: ^user}}
    end

    test "nonprivileged users cannot update", %{account: account} do
      user = insert(:user, account: account)
      webhook = insert(:integration_webhook, account: user.account)

      {:error, _} = Accounts.update_webhook(%{
        name: "webhook",
        url: "https://example.com",
        actions: ["incident.create"]
      }, webhook.id, user)
    end
  end

  describe "#delete_webhook/2" do
    setup [:setup_root_user]

    test "root users can delete webhooks", %{user: user} do
      webhook = insert(:integration_webhook, account: user.account)
      {:ok, deleted} = Accounts.delete_webhook(webhook.id, user)

      assert deleted.id == webhook.id
      refute refetch(webhook)

      assert_receive {:event, %PubSub.IntegrationWebhookDeleted{item: ^deleted, actor: ^user}}
    end

    test "nonprivileged users cannot delete", %{account: account} do
      user = insert(:user, account: account)
      webhook = insert(:integration_webhook, account: user.account)

      {:error, _} = Accounts.delete_webhook(webhook.id, user)
    end
  end

  describe "#create_oauth_integration/2" do
    setup [:setup_root_user]

    test "It can create a zoom integration", %{user: user} do
      expect(HTTPoison, :post, fn "https://zoom.us/oauth/token" <> _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{access_token: "at", refresh_token: "rt", expires_in: 3600})}}
      end)

      {:ok, oauth} = Accounts.create_oauth_integration(%{service: :zoom, code: "code", redirect_uri: "redirect"}, user)

      assert oauth.account_id == user.account_id
      assert oauth.access_token == "at"
      assert oauth.refresh_token == "rt"
      assert Timex.before?(Timex.now(), oauth.expires_at)
    end

    test "It fails for unauthed users", %{account: account} do
      user = insert(:user, account: account)
      reject(&HTTPoison.post/3)

      {:error, _} = Accounts.create_oauth_integration(%{service: :zoom, code: "code", redirect_uri: "redirect"}, user)
    end
  end

  describe "#create_zoom_meeting/2" do
    test "it can create a zoom meeting with an active integration" do
      oauth = insert(:oauth_integration)
      user  = insert(:user, account: oauth.account)
      expect(HTTPoison, :post, fn "https://api.zoom.us/v2/users/me/meetings", _, _ ->
        {:ok, %{status_code: 201, body: Jason.encode!(%{join_url: "https://zoom.us/j/1100000"})}}
      end)

      {:ok, result} = Accounts.create_zoom_meeting(%{topic: "A zoom meeting"}, user)

      assert result.join_url == "https://zoom.us/j/1100000"
      assert result.password

      assert_receive {:event, %PubSub.ZoomMeetingCreated{item: ^result, actor: ^user}}
    end
  end

  describe "#maybe_refresh/1" do
    test "An active access token is passed through" do
      oauth = insert(:oauth_integration)
      reject(&HTTPoison.post/3)

      refreshed = Accounts.maybe_refresh(oauth)

      assert refreshed.access_token == oauth.access_token
    end

    test "An expired access token is refreshed" do
      oauth = insert(:oauth_integration, expires_at: Timex.shift(Timex.now(), hours: -1))
      expect(HTTPoison, :post, fn "https://zoom.us/oauth/token" <> _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{access_token: "at-2", refresh_token: "rt", expires_in: 3600})}}
      end)

      refreshed = Accounts.maybe_refresh(oauth)

      assert refreshed.access_token == "at-2"
      assert Timex.before?(Timex.now(), refreshed.expires_at)
    end
  end

  describe "#enable_sso/3" do
    setup [:setup_root_user]
    test "an admin can set up sso", %{user: user} do
      mapping = insert(:domain_mapping, account: user.account, domain: "example.com")

      {:ok, acc} = Accounts.enable_sso("example.com", "conn", user)

      assert acc.id == user.account_id
      assert acc.workos_connection_id == "conn"
      assert refetch(mapping).enable_sso
    end

    test "nonadmins cannot enable", %{account: account} do
      insert(:domain_mapping, account: account, domain: "example.com")
      {:error, _} = Accounts.enable_sso("example.com", "conn", insert(:user, account: account))
    end
  end

  describe "#disable_sso/1" do
    setup [:setup_root_user]
    test "an admin can disable sso", %{user: user} do
      mapping = insert(:domain_mapping, account: user.account, domain: "example.com")

      {:ok, _} = Accounts.enable_sso("example.com", "conn", user)
      {:ok, acc} = Accounts.disable_sso(user)

      assert acc.id == user.account_id
      refute acc.workos_connection_id
      refute refetch(mapping).enable_sso
    end

    test "nonadmins cannot disable", %{account: account} do
      insert(:domain_mapping, account: account, domain: "example.com")
      {:error, _} = Accounts.enable_sso("example.com", "conn", insert(:user, account: account))
    end
  end

  describe "#delete_user/1" do
    setup [:setup_root_user]

    test "it will delete a root user properly", %{user: user} do
      other = insert(:user)

      {:ok, _} = Accounts.delete_user(user.email)

      refute refetch(user)
      assert refetch(other)
    end
  end

  describe "#license_key/0" do
    test "It can generate a valid year-long jwt with an enterprise claim" do
      {:ok, token} = Accounts.license_key()

      signer = Jwt.signer()
      {:ok, claims} = Jwt.verify(token, signer)

      assert claims["enterprise"]

      assert Timex.from_unix(claims["exp"])
             |> Timex.after?(Timex.shift(Timex.now(), days: 364))
    end
  end

  describe "#recompute_usage/1" do
    test "it correctly recomputes an accounts usage" do
      ac1 = insert(:account)
      [u | _] = insert_list(3, :user, account: ac1)
      insert(:user, account: ac1, service_account: true)
      insert(:upgrade_queue, user: u)
      insert(:upgrade_queue, user: u)

      ac2 = insert(:account)
      insert(:user, account: ac2)

      {:ok, updated} = Accounts.recompute_usage(ac1)

      assert updated.user_count == 3
      assert updated.cluster_count == 2
      assert updated.usage_updated
    end
  end

  describe "#license_key/1" do
    test "enterprise billing users can download license keys" do
      account = insert(:account, billing_customer_id: "cus_id", user_count: 2, cluster_count: 0)
      user = insert(:user, roles: %{admin: true}, account: account)
      enterprise_plan(account)

      {:ok, key} = Accounts.license_key(user)

      assert is_binary(key)
    end

    test "non billing users cannot downlod license keys" do
      account = insert(:account, billing_customer_id: "cus_id", user_count: 2, cluster_count: 0)
      user = insert(:user, account: account)
      enterprise_plan(account)

      {:error, _} = Accounts.license_key(user)
    end

    test "non enterprise accounts cannot downlod license keys" do
      account = insert(:account, billing_customer_id: "cus_id", user_count: 2, cluster_count: 0)
      user = insert(:user, roles: %{admin: true}, account: account)

      {:error, _} = Accounts.license_key(user)
    end
  end

  describe "#add_domain_mapping/2" do
    test "it can add a domain mapping to an account" do
      account = insert(:account)

      {:ok, mapping} = Accounts.add_domain_mapping("example.com", account.id)

      assert mapping.domain == "example.com"
      assert mapping.account_id == account.id
    end
  end
end
