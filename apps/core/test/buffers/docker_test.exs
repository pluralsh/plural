defmodule Core.Buffers.DockerTest do
  use Core.SchemaCase, async: false
  alias Core.Buffers.Docker

  describe "Core.Buffers.Docker" do
    test "it will collect images and deliver updates for all dependent queues" do
      dkr = insert(:docker_repository)
      img = insert(:docker_image, docker_repository: dkr)
      other_img = insert(:docker_image, docker_repository: dkr)

      {:ok, pid} = Docker.start()
      Process.monitor(pid)
      Docker.submit(pid, img)
      Docker.submit(pid, other_img)
      send(pid, :flush)

      assert_receive {:DOWN, _, :process, ^pid, _}

      [rollout] = Core.Repo.all(Core.Schema.Rollout)
      %Core.PubSub.DockerImagesPushed{item: imgs} = rollout.event

      assert rollout.status == :queued
      assert rollout.repository_id == dkr.repository_id
      assert ids_equal(imgs, [img, other_img])
    end
  end
end
