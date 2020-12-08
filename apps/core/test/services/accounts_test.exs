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
end