defmodule Core.Rollable.VersionsTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub
  alias Core.Services.Rollouts

  describe "VersionCreated" do
    test "it will execute a rollout for a version created event" do
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

      event = %PubSub.VersionCreated{item: version}
      {:ok, rollout} = Rollouts.create_rollout(chart.repository_id, event)

      {:ok, rolled} = Rollouts.execute(rollout)

      assert rolled.status == :finished
      assert rolled.count == 3

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
    test "it can execute version updated rollouts too" do
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

      event = %PubSub.VersionUpdated{item: version}
      {:ok, rollout} = Rollouts.create_rollout(chart.repository_id, event)

      {:ok, rolled} = Rollouts.execute(rollout)

      assert rolled.status == :finished
      assert rolled.count == 3

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
