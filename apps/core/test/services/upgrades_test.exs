defmodule Core.Services.UpgradesTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub
  alias Core.Services.Upgrades

  describe "#create_upgrade/2" do
    test "it'll create an upgrade for a repo" do
      queue = insert(:upgrade_queue)
      repo  = insert(:repository)

      {:ok, upgrade} = Upgrades.create_upgrade(%{
        repository_id: repo.id,
        message: "hey an upgrade"
      }, queue.user)

      assert upgrade.repository_id == repo.id
      assert upgrade.queue_id == queue.id
      assert upgrade.message == "hey an upgrade"

      assert_receive {:event, %PubSub.UpgradeCreated{item: ^upgrade}}
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
