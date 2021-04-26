defmodule Core.PubSub.Fanout.ChartsTest do
  use Core.SchemaCase, async: false
  alias Core.PubSub

  describe "VersionCreated" do
    test "On version create it will bump all subscribing chart installations" do
      chart = insert(:chart)
      version = insert(:version, version: "0.1.1", chart: chart)
      insert(:version_tag, version: version, chart: chart, tag: "latest")

      event = %PubSub.VersionCreated{item: version}
      {:ok, rollout} = Core.PubSub.Fanout.fanout(event)

      assert rollout.event.__struct__ == PubSub.VersionCreated
      assert rollout.repository_id == chart.repository_id
      assert rollout.status == :queued
    end
  end

  describe "VersionUpdated" do
    test "On version update it will bump all subscribing chart installations" do
      chart = insert(:chart)
      version = insert(:version, version: "0.1.1", chart: chart)
      insert(:version_tag, version: version, chart: chart, tag: "latest")

      event = %PubSub.VersionUpdated{item: version}
      {:ok, rollout} = Core.PubSub.Fanout.fanout(event)

      assert rollout.event.__struct__ == PubSub.VersionUpdated
      assert rollout.repository_id == chart.repository_id
      assert rollout.status == :queued
    end
  end
end
