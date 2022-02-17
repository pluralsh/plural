defmodule Core.Services.RolloutsTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Rollouts
  alias Core.PubSub

  describe "#unlock/1" do
    test "it will unlock locked module installations" do
      user = insert(:user)
      repo = insert(:repository)
      inst = insert(:installation, repository: repo, user: user)
      cl = insert(:chart_installation, installation: inst, locked: true, chart: insert(:chart, repository: repo))
      tl = insert(:terraform_installation, installation: inst, locked: true, terraform: insert(:terraform, repository: repo))

      ignore = insert(:chart_installation, locked: true, chart: cl.chart)

      {:ok, 2} = Rollouts.unlock(repo.name, user)

      refute refetch(cl).locked
      refute refetch(tl).locked

      assert refetch(ignore).locked
    end
  end

  describe "#create_rollout/2" do
    test "it can create a rollout for a repository and event" do
      repo = insert(:repository)
      v = insert(:version)

      event = %PubSub.VersionCreated{item: v}
      {:ok, rollout} = Rollouts.create_rollout(repo.id, event)

      assert rollout.id
      assert rollout.repository_id == repo.id
      assert rollout.count == 0
      assert rollout.event == event

      assert_receive {:event, %PubSub.RolloutCreated{item: ^rollout}}
    end
  end

  describe "#rollout_updated/2" do
    test "it can update rollout attributes" do
      rollout = insert(:rollout)

      {:ok, updated} = Rollouts.update_rollout(rollout, %{
        count: 1,
        cursor: uuid(0),
        heartbeat: Timex.now()
      })

      assert updated.count == 1

      assert_receive {:event, %PubSub.RolloutUpdated{item: ^updated}}
    end
  end

  describe "#poll/0" do
    test "it will only poll rollouts from repositories where the first non-finished rollout is eligible" do
      [repo1, repo2, repo3] = insert_list(3, :repository)
      insert(:rollout, id: uuid(0), repository: repo1, status: :running, heartbeat: Timex.now())
      insert(:rollout, id: uuid(1), repository: repo1, status: :queued)

      first = insert(:rollout, id: uuid(0), repository: repo2, status: :queued)
      insert(:rollout, id: uuid(1), repository: repo2, status: :finished)

      stale = Timex.now() |> Timex.shift(hours: -1)
      second = insert(:rollout, id: uuid(0), repository: repo3, status: :running, heartbeat: stale)
      insert(:rollout, id: uuid(1), repository: repo3, status: :finished)

      {:ok, found} = Rollouts.poll()

      assert ids_equal(found, [first, second])
      assert Enum.all?(found, & &1.status == :running)
      assert Enum.all?(found, & &1.heartbeat)
    end
  end
end
