defmodule GraphQl.ClusterQueriesTest do
  use Core.SchemaCase, async: false
  import GraphQl.TestHelpers

  describe "cluster" do
    test "it can fetch a cluster by id" do
      user = insert(:user)
      cluster = insert(:cluster, owner: user)
      dep = insert(:cluster_dependency, cluster: cluster)

      {:ok, %{data: %{"cluster" => found}}} = run_query("""
        query Cluster($id: ID!) {
          cluster(id: $id) {
            id
            dependency { id }
          }
        }
      """, %{"id" => cluster.id}, %{current_user: user})

      assert found["id"] == cluster.id
      assert found["dependency"]["id"] == dep.id
    end

    test "it can fetch usage history for a cluster" do
      user = insert(:user)
      cluster = insert(:cluster, owner: user)
      history = insert(:cluster_usage_history, cluster: cluster)
      begin = Timex.now() |> Timex.shift(hours: -3) |> DateTime.to_iso8601()

      {:ok, %{data: %{"cluster" => found}}} = run_query("""
        query Cluster($id: ID!, $begin: DateTime!) {
          cluster(id: $id) {
            id
            usageHistory(begin: $begin) { cpu memory }
          }
        }
      """, %{"id" => cluster.id, "begin" => begin}, %{current_user: user})

      assert found["id"] == cluster.id
      [hist] = found["usageHistory"]
      assert hist["cpu"] == history.cpu
      assert hist["memory"] == history.memory
    end

    test "it can query upgrade info" do
      user = insert(:user)
      cluster = insert(:cluster, owner: user)

      repo1 = insert(:repository)
      inst1 = insert(:installation, repository: repo1)
      repo2 = insert(:repository)
      inst2 = insert(:installation, repository: repo2)
      insert_list(3, :deferred_update,
        user: user,
        pending: true,
        chart_installation: insert(:chart_installation, installation: inst1)
      )
      insert_list(2, :deferred_update,
        user: user,
        pending: true,
        chart_installation: insert(:chart_installation, installation: inst2)
      )

      {:ok, %{data: %{"cluster" => %{"upgradeInfo" => info}}}} = run_query("""
        query Cluster($id: ID!) {
          cluster(id: $id) {
            id
            upgradeInfo {
              installation { repository { id } }
              count
            }
          }
        }
      """, %{"id" => cluster.id}, %{current_user: user})

      info = Map.new(info, & {&1["installation"]["repository"]["id"], &1})
      assert info[repo1.id]["count"] == 3
      assert info[repo2.id]["count"] == 2
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
    test "a user can list active clusters they own or can access" do
      user = insert(:user)
      sa = insert(:user, service_account: true, account: user.account)
      %{group: group} = insert(:impersonation_policy_binding,
        policy: build(:impersonation_policy, user: sa),
        group: insert(:group, account: user.account)
      )
      insert(:group_member, user: user, group: group)

      c1 = insert(:cluster, account: user.account, owner: user, queue: build(:upgrade_queue))
      c2 = insert(:cluster, account: sa.account, owner: sa)
      insert(:cluster, owner: user, pinged_at: Timex.now() |> Timex.shift(days: -3))

      insert(:cloud_shell, user: user)

      {:ok, %{data: %{"clusters" => found}}} = run_query("""
        query {
          clusters(first: 5) {
            edges {
              node {
                id
                queue { id }
                owner { id hasShell }
              }
            }
          }
        }
      """, %{}, %{current_user: Core.Services.Rbac.preload(user)})

      clusters = from_connection(found)
      assert ids_equal(clusters, [c1, c2])

      cluster = Enum.find(clusters, & &1["owner"]["id"] == user.id)
      assert cluster["queue"]["id"] == c1.queue.id
      assert cluster["owner"]["hasShell"]
    end
  end
end
