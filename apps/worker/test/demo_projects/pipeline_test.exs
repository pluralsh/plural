defmodule Worker.DemoProjects.PipelineTest do
  use Core.SchemaCase, async: false
  use Mimic
  alias Worker.DemoProjects

  setup :set_mimic_global

  describe "demo projects pipeline" do
    test "it can poll and process demo projects" do
      {:ok, producer} = DemoProjects.Producer.start_link()
      {:ok, _} = DemoProjects.Pipeline.start_link(producer)

      expect(Goth.Token, :for_scope, fn _ -> {:ok, %{token: "token"}} end)
      expect(GoogleApi.CloudResourceManager.V3.Api.Projects, :cloudresourcemanager_projects_delete, fn _, _ ->
        {:ok, %{name: "operations/123"}}
      end)

      demo = insert(:demo_project, inserted_at: Timex.now() |> Timex.shift(hours: -24))

      :timer.sleep(:timer.seconds(3))

      refute refetch(demo)
    end
  end
end
