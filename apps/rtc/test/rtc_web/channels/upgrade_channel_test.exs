defmodule RtcWeb.UpgradeChannelTest do
  use RtcWeb.ChannelCase, async: false

  describe "upgrade queue" do
    test "it can send and ack the next upgrade through the socket" do
      user = insert(:user)
      q    = insert(:upgrade_queue, user: user)
      up   = insert(:upgrade, queue: q, config: %{paths: [%{path: ".c", value: "a", type: :string}]})
      {:ok, _} = Jason.encode(up)

      {:ok, socket} = mk_socket(user)
      {:ok, _, socket} = subscribe_and_join(socket, "queues:#{q.id}", %{})

      ref = push(socket, "next", %{})
      assert_reply ref, :ok, result

      assert result.id == up.id
      assert result.repository.id == up.repository.id

      ref = push(socket, "ack", %{"id" => up.id})
      assert_reply ref, :ok, _

      assert refetch(q).acked == up.id

      ref = push(socket, "next", %{})
      assert_reply ref, :error, _
    end

    test "it can buffer new upgrades" do
      user = insert(:user)
      q    = insert(:upgrade_queue, user: user)
      up   = insert(:upgrade, queue: q)

      {:ok, socket} = mk_socket(user)
      {:ok, _, socket} = subscribe_and_join(socket, "queues:#{q.id}", %{})

      broadcast_from(socket, "new_upgrade", up)

      assert_push "more", %{"target" => id}
      assert id == up.id

      broadcast_from(socket, "new_upgrade", %{id: "00000000-0000-0000-0000-000000000000"})

      refute_push "more", _
    end

    test "it can receive usage history" do
      user = insert(:user)
      cluster = insert(:cluster, owner: user)
      q    = insert(:upgrade_queue, user: user, cluster: cluster)

      {:ok, socket} = mk_socket(user)
      {:ok, _, socket} = subscribe_and_join(socket, "queues:#{q.id}", %{})

      ref = push(socket, "usage", %{"services" => 15, "clusters" => 3})
      assert_reply ref, :ok, _

      [hist] = Core.Schema.ClusterUsageHistory.for_cluster(cluster.id) |> Core.Repo.all()
      assert hist.services == 15
      assert hist.clusters == 3

      assert refetch(cluster).service_count == 15
      assert refetch(cluster).cluster_count == 3
    end
  end
end
