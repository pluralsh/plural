defmodule Core.Services.ClustersTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.Services.Clusters

  describe "#create_cluster/2" do
    test "a user can create a cluster" do
      user = insert(:user)

      {:ok, cluster} = Clusters.create_cluster(%{name: "cluster", provider: :aws}, user)

      assert cluster.name == "cluster"
      assert cluster.provider == :aws
      assert cluster.account_id == user.account_id
      assert cluster.owner_id == user.id
      assert cluster.source == :default
    end

    test "it can populate installation source" do
      user = insert(:user)
      insert(:cloud_shell, user: user)

      {:ok, cluster} = Clusters.create_cluster(%{name: "cluster", provider: :aws}, user)

      assert cluster.name == "cluster"
      assert cluster.provider == :aws
      assert cluster.source == :shell
    end
  end

  describe "#create_from_queue/1" do
    test "it can create a new cluster from an upgrade queue" do
      queue = insert(:upgrade_queue, domain: "console.plural.sh", git: "git@github.com/pluralsh/repo", provider: :aws)

      {:ok, cluster} = Clusters.create_from_queue(queue)

      assert cluster.name == queue.name
      assert cluster.provider == queue.provider
      assert cluster.owner_id == queue.user_id
      assert cluster.account_id == queue.user.account_id
      assert cluster.domain == "plural.sh"
      assert cluster.console_url == "console.plural.sh"
      assert cluster.git_url == "git@github.com/pluralsh/repo"

      assert refetch(queue).cluster_id == cluster.id
    end

    test "it can create w/ existing queus" do
      queue = insert(:upgrade_queue, domain: "console.plural.sh", git: "git@github.com/pluralsh/repo", provider: :aws)
      cluster = insert(:cluster, name: queue.name, provider: queue.provider, account: queue.user.account, owner: queue.user)
      insert(:upgrade_queue, cluster: cluster)

      {:ok, _} = Clusters.create_from_queue(queue)
    end

    test "if the cluster already exists, it will still tie in the queue" do
      queue = insert(:upgrade_queue, domain: "console.plural.sh", git: "git@github.com/pluralsh/repo", provider: :aws)
      cluster = insert(:cluster, name: queue.name, provider: queue.provider, account: queue.user.account, owner: queue.user)

      {:ok, created} = Clusters.create_from_queue(queue)

      assert created.id == cluster.id
      assert created.console_url == "console.plural.sh"

      assert refetch(queue).cluster_id == cluster.id
    end
  end

  describe "#create_dependency/3" do
    test "a user can create a dependency between accessible clusters" do
      user = insert(:user)
      sa = insert(:user, service_account: true, account: user.account)
      insert(:impersonation_policy_binding,
        policy: build(:impersonation_policy, user: sa),
        user: user
      )
      dest   = insert(:cluster, owner: user)
      source = insert(:cluster, owner: sa)

      {:ok, dep} = Clusters.create_dependency(source, dest, user)

      assert dep.cluster_id == dest.id
      assert dep.dependency_id == source.id
      assert refetch(user).upgrade_to
    end

    test "a user cannot create a dependency on inaccessible clusters" do
      user = insert(:user)
      sa = insert(:user, service_account: true, account: user.account)
      dest   = insert(:cluster, owner: user)
      source = insert(:cluster, owner: sa)

      {:error, _} = Clusters.create_dependency(source, dest, user)
    end

    test "a user cannot create a dependency between clusters w/ different providers" do
      user = insert(:user)
      sa = insert(:user, service_account: true, account: user.account)
      insert(:impersonation_policy_binding,
        policy: build(:impersonation_policy, user: sa),
        user: user
      )
      dest   = insert(:cluster, owner: user)
      source = insert(:cluster, owner: sa, provider: :gcp)

      {:error, _} = Clusters.create_dependency(source, dest, user)
    end
  end

  describe "promote/1" do
    test "a user can promote from their dependency clusters" do
      user = insert(:user, upgrade_to: uuid(0))
      def_ups = insert_list(3, :deferred_update, user: user, pending: true)

      {:ok, update} = Clusters.promote(user)

      assert update.upgrade_to > user.upgrade_to

      for def <- def_ups,
        do: assert refetch(def).dequeue_at
    end
  end

  describe "#delete_cluster/2" do
    test "a user can delete their own cluster" do
      user = insert(:user)
      domain = insert(:dns_domain, name: "example.com")
      cluster = insert(:cluster, owner: user, account: user.account, domain: domain.name)

      me = self()
      insert(:dns_record, provider: :gcp, domain: domain, creator: user)
      records = insert_list(3, :dns_record, provider: cluster.provider, cluster: cluster.name, creator: user, domain: domain)
      expect(Core.Conduit.Broker, :publish, 3, fn %{body: r}, :cluster -> send(me, {:record, r}) end)

      {:ok, deleted} = Clusters.delete_cluster(cluster.name, cluster.provider, user)

      assert deleted.id == cluster.id
      refute refetch(deleted)

      for %{id: id} <- records,
        do: assert_receive {:record, %{id: ^id}}
    end

    test "a user cannot delete other's clusters" do
      user = insert(:user)
      cluster = insert(:cluster, account: user.account)

      {:error, _} = Clusters.delete_cluster(cluster.name, cluster.provider, user)
    end

    test "a user cannot delete a cluster that doesn't exist" do
      user = insert(:user)

      {:error, _} = Clusters.delete_cluster("bogus", :aws, user)
    end
  end
end
