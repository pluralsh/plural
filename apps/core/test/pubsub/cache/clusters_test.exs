defmodule Core.PubSub.Consumers.Cache.ClustersTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub
  alias Core.PubSub.Consumers.Cache

  describe "ClusterDependencyCreated" do
    test "it will overwrite the login cache" do
      user = insert(:user)
      dependency = insert(:cluster_dependency)

      event = %PubSub.ClusterDependencyCreated{item: dependency, actor: user}
      Cache.handle_event(event)

      found = Core.Cache.get({:login, user.id})
      assert found.id == user.id
    end
  end
end
