defmodule Core.Buffers.DockerTest do
  use Core.SchemaCase, async: false
  alias Core.Buffers.Docker

  describe "Core.Buffers.Docker" do
    test "it will collect images and deliver updates for all dependent queues" do
      user = insert(:user)
      q = insert(:upgrade_queue, user: user)
      repository = insert(:repository)
      chart = insert(:chart, repository: repository)
      vsn   = insert(:version, chart: chart)
      insert(:chart_installation,
        installation: build(:installation, repository: repository, user: user),
        version: vsn
      )
      dkr = insert(:docker_repository, repository: repository)
      img = insert(:docker_image, docker_repository: dkr)
      insert(:image_dependency, version: vsn, image: img)
      other_img = insert(:docker_image)

      {:ok, pid} = Docker.start()
      Process.monitor(pid)
      Docker.submit(pid, img)
      Docker.submit(pid, other_img)
      send(pid, :flush)

      assert_receive {:DOWN, _, :process, ^pid, _}

      [upgrade] = Core.Repo.all(Core.Schema.Upgrade)
      assert upgrade.queue_id == q.id
    end
  end
end
