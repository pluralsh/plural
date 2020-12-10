defmodule GraphQl.AccountMutationTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "updateAccount" do
    setup [:setup_root_user]

    test "it can update accounts", %{user: user} do
      {:ok, %{data: %{"updateAccount" => account}}} = run_query("""
        mutation updateAccount($name: String) {
          updateAccount(attributes: {name: $name}) {
            name
          }
        }
      """, %{"name" => "updated"}, %{current_user: user})

      assert account["name"] == "updated"
    end
  end

  describe "createInvite" do
    setup [:setup_root_user]

    test "creates an invite", %{user: user} do
      {:ok, %{data: %{"createInvite" => create}}} = run_query("""
        mutation Create($attributes: InviteAttributes!) {
          createInvite(attributes: $attributes) {
            email
          }
        }
      """, %{"attributes" => %{"email" => "some@email.com"}}, %{current_user: user})


      assert create["email"] == "some@email.com"
    end
  end

  describe "createGroup" do
    setup [:setup_root_user]

    test "creates a group", %{user: user} do
      {:ok, %{data: %{"createGroup" => create}}} = run_query("""
        mutation Create($attributes: GroupAttributes!) {
          createGroup(attributes: $attributes) {
            name
          }
        }
      """, %{"attributes" => %{"name" => "group"}}, %{current_user: user})

      assert create["name"] == "group"
    end
  end

  describe "updateGroup" do
    setup [:setup_root_user]

    test "updates a group", %{user: user, account: account} do
      group = insert(:group, account: account)
      {:ok, %{data: %{"updateGroup" => create}}} = run_query("""
        mutation Update($groupId: ID!, $attributes: GroupAttributes!) {
          updateGroup(groupId: $groupId, attributes: $attributes) {
            name
          }
        }
      """, %{"groupId" => group.id, "attributes" => %{"name" => "group"}}, %{current_user: user})

      assert create["name"] == "group"
    end
  end

  describe "deleteGroup" do
    setup [:setup_root_user]

    test "deletes a group", %{user: user, account: account} do
      group = insert(:group, account: account)
      {:ok, %{data: %{"deleteGroup" => create}}} = run_query("""
        mutation Update($groupId: ID!) {
          deleteGroup(groupId: $groupId) {
            id
          }
        }
      """, %{"groupId" => group.id}, %{current_user: user})

      assert create["id"] == group.id

      refute refetch(group)
    end
  end

  describe "createGroupMember" do
    setup [:setup_root_user]

    test "creates a group member", %{user: user, account: account} do
      group = insert(:group, account: account)
      other = insert(:user)
      {:ok, %{data: %{"createGroupMember" => create}}} = run_query("""
        mutation Update($groupId: ID!, $userId: ID!) {
          createGroupMember(groupId: $groupId, userId: $userId) {
            id
            user { id }
            group { id }
          }
        }
      """, %{"groupId" => group.id, "userId" => other.id}, %{current_user: user})

      assert create["group"]["id"] == group.id
      assert create["user"]["id"] == other.id
    end
  end

  describe "deleteGroupMember" do
    setup [:setup_root_user]

    test "creates a group member", %{user: user, account: account} do
      group = insert(:group, account: account)
      member = insert(:group_member, group: group)
      {:ok, %{data: %{"deleteGroupMember" => delete}}} = run_query("""
        mutation Update($groupId: ID!, $userId: ID!) {
          deleteGroupMember(groupId: $groupId, userId: $userId) {
            id
            user { id }
            group { id }
          }
        }
      """, %{"groupId" => group.id, "userId" => member.user.id}, %{current_user: user})

      assert delete["id"] == member.id
      assert delete["group"]["id"] == group.id
      assert delete["user"]["id"] == member.user.id

      refute refetch(member)
    end
  end

  describe "createRole" do
    setup [:setup_root_user]

    test "it can create roles", %{user: user} do
      {:ok, %{data: %{"createRole" => create}}} = run_query("""
        mutation Create($attributes: RoleAttributes!) {
          createRole(attributes: $attributes) {
            name
            repositories
            permissions
          }
        }
      """, %{"attributes" => %{
        "name" => "role", "repositories" => ["*"], "permissions" => ["INSTALL"]
      }}, %{current_user: user})

      assert create["name"] == "role"
      assert create["repositories"] == ["*"]
      assert create["permissions"] == ["INSTALL"]
    end
  end

  describe "updateRole" do
    setup [:setup_root_user]

    test "it can create roles", %{user: user, account: account} do
      role = insert(:role, account: account)
      {:ok, %{data: %{"updateRole" => update}}} = run_query("""
        mutation Update($attributes: RoleAttributes!, $id: ID!) {
          updateRole(id: $id, attributes: $attributes) {
            id
            name
            repositories
            permissions
          }
        }
      """, %{
        "id" => role.id,
        "attributes" => %{
          "name" => "role", "repositories" => ["*"], "permissions" => ["INSTALL"]
        }
      }, %{current_user: user})

      assert update["id"] == role.id
      assert update["name"] == "role"
      assert update["repositories"] == ["*"]
      assert update["permissions"] == ["INSTALL"]
    end
  end

  describe "deleteRole" do
    setup [:setup_root_user]

    test "it can create roles", %{user: user, account: account} do
      role = insert(:role, account: account)
      {:ok, %{data: %{"deleteRole" => delete}}} = run_query("""
        mutation Create($id: ID!) {
          deleteRole(id: $id) {
            id
          }
        }
      """, %{"id" => role.id}, %{current_user: user})

      assert delete["id"] == role.id
      refute refetch(role)
    end
  end
end