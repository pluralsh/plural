defmodule GraphQl.ClusterQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "cluster" do
    test "it can fetch a cluster by id" do
      user = insert(:user)
      cluster = insert(:cluster, owner: user)

      {:ok, %{data: %{"cluster" => found}}} = run_query("""
        query Cluster($id: ID!) {
          cluster(id: $id) { id }
        }
      """, %{"id" => cluster.id}, %{current_user: user})

      assert found["id"] == cluster.id
    end

    test "a user can access clusters via service account" do
      user = insert(:user)
      sa = insert(:user, service_account: true, account: user.account)
      %{group: group} = insert(:impersonation_policy_binding,
        policy: build(:impersonation_policy, user: sa),
        group: insert(:group, account: user.account)
      )
      insert(:group_member, user: user, group: group)
      cluster = insert(:cluster, account: sa.account, owner: sa)

      {:ok, %{data: %{"cluster" => found}}} = run_query("""
        query Cluster($id: ID!) {
          cluster(id: $id) { id }
        }
      """, %{"id" => cluster.id}, %{current_user: Core.Services.Rbac.preload(user)})

      assert found["id"] == cluster.id
    end

    test "it's forbidden if a user cannot access the cluster" do
      user = insert(:user)
      cluster = insert(:cluster)

      {:ok, %{errors: [_ | _]}} = run_query("""
        query Cluster($id: ID!) {
          cluster(id: $id) { id }
        }
      """, %{"id" => cluster.id}, %{current_user: user})
    end
  end

  describe "clusters" do
    test "a user can list clusters they own or can access" do
      user = insert(:user)
      sa = insert(:user, service_account: true, account: user.account)
      %{group: group} = insert(:impersonation_policy_binding,
        policy: build(:impersonation_policy, user: sa),
        group: insert(:group, account: user.account)
      )
      insert(:group_member, user: user, group: group)

      c1 = insert(:cluster, account: user.account, owner: user)
      c2 = insert(:cluster, account: sa.account, owner: sa)

      {:ok, %{data: %{"clusters" => found}}} = run_query("""
        query {
          clusters(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: Core.Services.Rbac.preload(user)})

      assert from_connection(found)
             |> ids_equal([c1, c2])
    end
  end
end
