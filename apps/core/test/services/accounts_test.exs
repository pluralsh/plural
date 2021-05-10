defmodule Core.Services.AccountsTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.PubSub
  alias Core.Services.Accounts

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
    test "it can assume a service account with a matching policy" do
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

    test "it cannot assume if the policy doesn't match" do
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
      other = insert(:user)
      {:ok, gm} = Accounts.create_group_member(%{user_id: other.id}, group.id, user)

      assert gm.group_id == group.id
      assert gm.user_id == other.id

      assert_receive {:event, %PubSub.GroupMemberCreated{item: ^gm, actor: ^user}}
    end

    test "nonroot users cannot create group members", %{account: account} do
      group = insert(:group, account: account)
      other = insert(:user)
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

    test "nonroot users can create group members", %{account: account} do
      {:error, _} = Accounts.create_invite(%{email: "some@example.com"}, insert(:user, account: account))
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
    end
  end

  describe "#create_role/2" do
    setup [:setup_root_user]

    test "Root users can create roles", %{user: user, account: account} do
      group = insert(:group)
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
end
