defmodule Core.Rollable.DockerTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub
  alias Core.Services.Rollouts

  describe "DockerImagesPushed" do
    test "it can execute a rollout for pushed docker images" do
      %{user: user} = q = insert(:upgrade_queue)
      %{repository: repository} = chart = insert(:chart)
      vsn   = insert(:version, chart: chart)
      insert(:chart_installation,
        installation: build(:installation, repository: repository, user: user),
        version: vsn
      )
      dkr = insert(:docker_repository, repository: repository)
      img = insert(:docker_image, docker_repository: dkr)
      insert(:image_dependency, version: vsn, image: img)
      other_img = insert(:docker_image)

      event = %PubSub.DockerImagesPushed{item: [img, other_img]}
      {:ok, rollout} = Rollouts.create_rollout(repository.id, event)

      {:ok, rolled} = Rollouts.execute(rollout)

      assert rolled.status == :finished
      assert rolled.count == 1

      [upgrade] = Core.Repo.all(Core.Schema.Upgrade)
      assert upgrade.queue_id == q.id
      assert upgrade.type == :bounce
    end
  end
end
