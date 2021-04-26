defmodule Worker.Rollouts.PipelineTest do
  use Core.SchemaCase, async: false
  alias Worker.Rollouts
  alias Core.PubSub

  describe "rollout pipeline" do
    test "it can poll and process rollouts" do
      {:ok, producer} = Rollouts.Producer.start_link()
      {:ok, _} = Rollouts.Pipeline.start_link(producer)

      event = %PubSub.VersionCreated{item: insert(:version)}
      roll = insert(:rollout, status: :queued, repository: build(:repository), event: event)

      :timer.sleep(:timer.seconds(6))

      assert refetch(roll).status == :finished
    end
  end
end
