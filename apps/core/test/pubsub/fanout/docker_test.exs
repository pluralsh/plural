defmodule Core.PubSub.Fanout.DockerTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.PubSub

  setup do
    Application.ensure_all_started(:swarm)
    :ok
  end

  describe "DockerNotification" do
    test "It will process all supported notifications" do
      repository = insert(:repository)
      user = insert(:user)
      name = "#{repository.name}/dkr_image"

      event = %PubSub.DockerNotification{item: %{"events" => [
        %{
          "action" => "push",
          "target" => %{"repository" => name, "tag" => "latest", "digest" => "digest"},
          "actor" => %{"name" => user.email}
        }
      ]}}

      [{:ok, %{repo: repo, image: img}}] = Core.PubSub.Fanout.fanout(event)

      assert repo.name == "dkr_image"
      assert repo.repository_id == repository.id

      assert img.tag == "latest"
      assert img.digest == "digest"
      assert img.docker_repository_id == repo.id
    end
  end

  describe "DockerImageCreated" do
    test "it will send to rabbit" do
      img = insert(:docker_image)
      expect(Core.Conduit.Broker, :publish, fn %Conduit.Message{body: ^img}, :dkr -> :ok end)
      expect(Core.Buffers.Docker, :submit, fn _, ^img -> :ok end)
      event = %PubSub.DockerImageCreated{item: img}
      Core.PubSub.Fanout.fanout(event)
    end
  end
end
