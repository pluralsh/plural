defmodule GraphQl.ClusterMutationsTest do
  use Core.SchemaCase, async: true
  use Mimic
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

  describe "createClusterDependency" do
    test "it will create a dependency reference" do
      user = insert(:user)
      enable_features(user.account, [:multi_cluster])
      sa = insert(:user, service_account: true, account: user.account)
      insert(:impersonation_policy_binding,
        policy: build(:impersonation_policy, user: sa),
        user: user
      )
      dest   = insert(:cluster, owner: user)
      source = insert(:cluster, owner: sa)

      {:ok, %{data: %{"createClusterDependency" => dep}}} = run_query("""
        mutation Create($source: ID!, $dest: ID!) {
          createClusterDependency(sourceId: $source, destId: $dest) {
            cluster { id }
            dependency { id }
          }
        }
      """, %{"source" => source.id, "dest" => dest.id}, %{current_user: user})

      assert dep["cluster"]["id"] == dest.id
      assert dep["dependency"]["id"] == source.id
    end

    test "if the feature isn't enabled, it cannot create" do
      user = insert(:user)
      sa = insert(:user, service_account: true, account: user.account)
      insert(:impersonation_policy_binding,
        policy: build(:impersonation_policy, user: sa),
        user: user
      )
      dest   = insert(:cluster, owner: user)
      source = insert(:cluster, owner: sa)

      {:ok, %{errors: [_ | _]}} = run_query("""
        mutation Create($source: ID!, $dest: ID!) {
          createClusterDependency(sourceId: $source, destId: $dest) {
            cluster { id }
            dependency { id }
          }
        }
      """, %{"source" => source.id, "dest" => dest.id}, %{current_user: user})
    end
  end

  describe "deleteClusterDependency" do
    test "it will delete a dependency reference" do
      user = insert(:user)
      sa = insert(:user, service_account: true, account: user.account)
      insert(:impersonation_policy_binding,
        policy: build(:impersonation_policy, user: sa),
        user: user
      )
      dest   = insert(:cluster, owner: user)
      source = insert(:cluster, owner: sa)
      insert(:cluster_dependency, cluster: dest, dependency: source)

      {:ok, %{data: %{"deleteClusterDependency" => dep}}} = run_query("""
        mutation Delete($source: ID!, $dest: ID!) {
          deleteClusterDependency(sourceId: $source, destId: $dest) {
            cluster { id }
            dependency { id }
          }
        }
      """, %{"source" => source.id, "dest" => dest.id}, %{current_user: user})

      assert dep["cluster"]["id"] == dest.id
      assert dep["dependency"]["id"] == source.id
    end
  end

  describe "promote" do
    test "it can do a promotion" do
      user = insert(:user, upgrade_to: uuid(0))

      {:ok, %{data: %{"promote" => promo}}} = run_query("""
        mutation {
          promote { id }
        }
      """, %{}, %{current_user: user})

      assert promo["id"] == user.id
      assert refetch(user).upgrade_to > user.upgrade_to
    end
  end

  describe "transferOwnership" do
    test "it can transfer cluster ownership" do
      %{owner: user} = cluster = insert(:cluster, provider: :aws, owner: insert(:user, provider: :aws))
      sa = bound_service_account(user, roles: %{admin: true})

      {:ok, %{data: %{"transferOwnership" => updated}}} = run_query("""
        mutation Transfer($name: String!, $email: String!) {
          transferOwnership(name: $name, email: $email) {
            id
            owner { id }
          }
        }
      """, %{"name" => cluster.name, "email" => sa.email}, %{current_user: user})

      assert updated["owner"]["id"] == sa.id
    end
  end

  describe "pingCluster" do
    test "it can ping a cluster" do
      user = insert(:user)
      expect(Core.Conduit.Broker, :publish, fn _, :billing -> :ok end)

      {:ok, %{data: %{"pingCluster" => pinged}}} = run_query("""
        mutation Ping($attrs: ClusterPingAttributes!) {
          pingCluster(attributes: $attrs) {
            id
            name
            provider
            pingedAt
            owner { id }
          }
        }
      """, %{
        "attrs" => %{
          "cluster" => %{"name" => "my-cluster", "provider" => "AWS"},
          "usage" => %{"bytesIngested" => 1000, "services" => 1, "clusters" => 1}
        }
      }, %{current_user: user})

      assert pinged["name"] == "my-cluster"
      assert pinged["provider"] == "AWS"
      assert pinged["pingedAt"]
      assert pinged["owner"]["id"] == user.id

      cluster = Core.Services.Clusters.get_cluster!(pinged["id"])

      assert cluster.service_count == 1
      assert cluster.cluster_count == 1
    end
  end
end
