defmodule GraphQl.ClusterMutationsTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "createCluster" do
    test "a user can register a cluster" do
      user = insert(:user)

      {:ok, %{data: %{"createCluster" => cluster}}} = run_query("""
        mutation Create($attrs: ClusterAttributes!) {
          createCluster(attributes: $attrs) {
            name
            provider
            source
          }
        }
      """, %{"attrs" => %{"name" => "cluster", "provider" => "AWS"}}, %{current_user: user})

      assert cluster["name"] == "cluster"
      assert cluster["provider"] == "AWS"
      assert cluster["source"] == "DEFAULT"
    end
  end

  describe "deleteCluster" do
    test "a user can deregister a cluster" do
      user = insert(:user)
      cluster = insert(:cluster, owner: user, account: user.account)

      {:ok, %{data: %{"deleteCluster" => deleted}}} = run_query("""
        mutation Delete($name: String!, $provider: Provider!) {
          deleteCluster(name: $name, provider: $provider) { id }
        }
      """, %{"name" => cluster.name, "provider" => "AWS"}, %{current_user: user})

      assert cluster.id == deleted["id"]
      refute refetch(cluster)
    end
  end
end
