defmodule Core.PubSub.Fanout.ChartsTest do
  use Core.SchemaCase, async: false
  alias Core.PubSub

  describe "VersionCreated" do
    test "On version create it will bump all subscribing chart installations" do
      %{chart: chart} = chart_version = insert(:version, version: "0.1.0")
      auto_upgraded = for _ <- 1..3 do
        insert(:chart_installation,
          installation: insert(:installation, auto_upgrade: true),
          chart: chart,
          version: chart_version
        )
      end

      queues = for %{installation: %{user: user}} <- auto_upgraded do
        insert(:upgrade_queue, user: user)
      end

      ignored = insert_list(2, :chart_installation, chart: chart, version: chart_version)
      version = insert(:version, version: "0.1.1", chart: chart)
      insert(:version_tag, version: version, chart: chart, tag: "latest")

      3 = Core.PubSub.Fanout.fanout(%PubSub.VersionCreated{item: version})

      for bumped <- auto_upgraded,
        do: assert refetch(bumped).version_id == version.id

      for ignore <- ignored,
        do: assert refetch(ignore).version_id == chart_version.id

      for queue <- queues do
        assert Core.Schema.Upgrade.for_queue(queue.id) |> Core.Repo.exists?()
      end
    end
  end

  describe "VersionUpdated" do
    test "On version update it will bump all subscribing chart installations" do
      %{chart: chart} = chart_version = insert(:version, version: "0.1.0")
      auto_upgraded = for _ <- 1..3 do
        insert(:chart_installation,
          installation: insert(:installation, auto_upgrade: true),
          chart: chart,
          version: chart_version
        )
      end

      queues = for %{installation: %{user: user}} <- auto_upgraded do
        insert(:upgrade_queue, user: user)
      end

      ignored = insert_list(2, :chart_installation, chart: chart, version: chart_version)
      version = insert(:version, version: "0.1.1", chart: chart)
      insert(:version_tag, version: version, chart: chart, tag: "latest")

      3 = Core.PubSub.Fanout.fanout(%PubSub.VersionUpdated{item: version})

      for bumped <- auto_upgraded,
        do: assert refetch(bumped).version_id == version.id

      for ignore <- ignored,
        do: assert refetch(ignore).version_id == chart_version.id

      for queue <- queues do
        assert Core.Schema.Upgrade.for_queue(queue.id) |> Core.Repo.exists?()
      end
    end
  end
end
