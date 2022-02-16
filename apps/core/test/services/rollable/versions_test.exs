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

    test "it will lock an installation if the version is breaking" do
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
      version = insert(:version, version: "0.1.1", chart: chart, dependencies: %{breaking: true})
      insert(:version_tag, version: version, chart: chart, tag: "latest")

      event = %PubSub.VersionCreated{item: version}
      {:ok, rollout} = Rollouts.create_rollout(chart.repository_id, event)

      {:ok, rolled} = Rollouts.execute(rollout)

      assert rolled.status == :finished
      assert rolled.count == 3


      for %{id: id} = bumped <- auto_upgraded do
        inst = refetch(bumped)
        assert_receive {:event, %PubSub.InstallationLocked{item: %{id: ^id}}}
        assert inst.version_id == version.id
        assert inst.locked
      end

      for ignore <- ignored,
        do: assert refetch(ignore).version_id == chart_version.id

      for queue <- queues do
        refute Core.Schema.Upgrade.for_queue(queue.id) |> Core.Repo.exists?()
      end
    end

    test "it will defer updates if a version's dependencies aren't satisfied" do
      dep_chart = insert(:chart)
      %{chart: chart} = chart_version = insert(:version, version: "0.1.0")
      inst = insert(:chart_installation,
        installation: insert(:installation, auto_upgrade: true),
        chart: chart,
        version: chart_version
      )

      ignored = insert_list(2, :chart_installation, chart: chart, version: chart_version)
      version = insert(:version, version: "0.1.1", chart: chart, dependencies: %{dependencies: [
        %{type: :helm, repo: dep_chart.repository.name, name: dep_chart.name}
      ]})
      insert(:version_tag, version: version, chart: chart, tag: "latest")

      event = %PubSub.VersionCreated{item: version}
      {:ok, rollout} = Rollouts.create_rollout(chart.repository_id, event)

      {:ok, rolled} = Rollouts.execute(rollout)

      assert rolled.status == :finished
      assert rolled.count == 1

      for bumped <- [inst],
        do: assert refetch(bumped).version_id == chart_version.id

      for ignore <- ignored,
        do: assert refetch(ignore).version_id == chart_version.id

      [deferred] = Core.Repo.all(Core.Schema.DeferredUpdate)

      assert deferred.chart_installation_id == inst.id
      assert deferred.version_id == version.id
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

    test "it can execute version updated rollouts for terraform" do
      tf = insert(:terraform)
      tf_version = insert(:version, terraform: tf, chart: nil, chart_id: nil, version: "0.1.0")
      auto_upgraded = for _ <- 1..3 do
        insert(:terraform_installation,
          installation: insert(:installation, auto_upgrade: true),
          terraform: tf,
          version: tf_version
        )
      end

      queues = for %{installation: %{user: user}} <- auto_upgraded do
        insert(:upgrade_queue, user: user)
      end

      ignored = insert_list(2, :terraform_installation, terraform: tf, version: tf_version)
      version = insert(:version, chart: nil, chart_id: nil, version: "0.1.1", terraform: tf)
      insert(:version_tag, version: version, terraform: tf, tag: "latest")

      event = %PubSub.VersionUpdated{item: version}
      {:ok, rollout} = Rollouts.create_rollout(tf.repository_id, event)

      {:ok, rolled} = Rollouts.execute(rollout)

      assert rolled.status == :finished
      assert rolled.count == 3

      for bumped <- auto_upgraded,
        do: assert refetch(bumped).version_id == version.id

      for ignore <- ignored,
        do: assert refetch(ignore).version_id == tf_version.id

      for queue <- queues do
        assert Core.Schema.Upgrade.for_queue(queue.id) |> Core.Repo.exists?()
      end
    end
  end
end
