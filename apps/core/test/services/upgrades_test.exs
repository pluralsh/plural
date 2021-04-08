defmodule Core.Services.UpgradesTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub
  alias Core.Services.Upgrades

  describe "#create_queue/2" do
    test "it can create an upgrade queue for a user" do
      user = insert(:user)

      {:ok, queue} = Upgrades.create_queue(%{name: "cluster", provider: :aws}, user)

      assert queue.name == "cluster"
      assert queue.user_id == user.id

      assert refetch(user).default_queue_id == queue.id

      assert_receive {:event, %PubSub.UpgradeQueueCreated{item: ^queue}}
    end

    test "it can upsert upgrade queues" do
      queue = insert(:upgrade_queue, name: "cluster")

      {:ok, up} = Upgrades.create_queue(%{name: "cluster", provider: :aws}, queue.user)

      assert up.id == queue.id
      assert up.name == "cluster"
      assert up.provider == :aws
      assert up.user_id == queue.user.id

      assert_receive {:event, %PubSub.UpgradeQueueUpdated{item: ^up}}
    end
  end

  describe "#create_upgrade/2" do
    test "it'll create an upgrade for a repo" do
      queue = insert(:upgrade_queue)
      repo  = insert(:repository)
      {:ok, user} = Upgrades.update_default_queue(queue, queue.user)

      {:ok, upgrade} = Upgrades.create_upgrade(%{
        repository_id: repo.id,
        message: "hey an upgrade"
      }, user)

      assert upgrade.repository_id == repo.id
      assert upgrade.queue_id == queue.id
      assert upgrade.message == "hey an upgrade"

      assert_receive {:event, %PubSub.UpgradeCreated{item: ^upgrade}}
    end
  end

  describe "#ping/2" do
    test "it will set the pinged_at timestamp" do
      queue = insert(:upgrade_queue)

      {:ok, q} = Upgrades.ping(queue)

      assert q.id == queue.id
      assert q.pinged_at

      assert_receive {:event, %PubSub.UpgradeQueueUpdated{item: ^q}}
    end
  end

  describe "#ack/2" do
    test "it'll always ack unacked q's" do
      queue = insert(:upgrade_queue)
      upgrade = insert(:upgrade)

      {:ok, q} = Upgrades.ack(upgrade.id, queue)

      assert q.acked == upgrade.id

      assert_receive {:event, %PubSub.UpgradeQueueUpdated{item: ^q}}
    end

    test "it'll ack if the new id is later" do
      queue = insert(:upgrade_queue, acked: "00000000-0000-0000-0000-000000000000")
      upgrade = insert(:upgrade)

      {:ok, q} = Upgrades.ack(upgrade.id, queue)

      assert q.acked == upgrade.id
    end

    test "it'll ignore earlier ids" do
      queue = insert(:upgrade_queue, acked: "ffffffff-ffff-ffff-ffff-ffffffffffff")
      upgrade = insert(:upgrade)

      {:error, _} = Upgrades.ack(upgrade.id, queue)
    end
  end
end
