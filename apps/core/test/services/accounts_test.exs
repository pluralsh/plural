defmodule Core.Services.AccountsTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Accounts

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
      {:ok, _} = Accounts.delete_role(role.id, user)

      refute refetch(role)
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
    end

    test "nonprivileged users cannot delete", %{account: account} do
      user = insert(:user, account: account)
      webhook = insert(:integration_webhook, account: user.account)

      {:error, _} = Accounts.delete_webhook(webhook.id, user)
    end
  end
end
