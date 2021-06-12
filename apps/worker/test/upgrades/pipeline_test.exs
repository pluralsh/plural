defmodule Worker.Upgrades.PipelineTest do
  use Core.SchemaCase, async: false
  alias Worker.Upgrades

  describe "rollout pipeline" do
    test "it can poll and process upgrades" do
      {:ok, producer} = Upgrades.Producer.start_link(name: Worker.Upgrades.Producer, type: :chart)
      {:ok, _} = Upgrades.Pipeline.start_link([producer])

      chart = insert(:chart)
      other_chart = insert(:chart)
      user  = insert(:user)
      q = insert(:upgrade_queue, user: user)
      insert(:chart_installation,
        chart: chart,
        installation: insert(:installation, repository: chart.repository, user: user)
      )
      chart_inst = insert(:chart_installation,
        chart: other_chart,
        installation: insert(:installation, repository: other_chart.repository, user: user)
      )
      version = insert(:version, chart: other_chart, dependencies: %{dependencies: [
        %{type: :helm, repo: chart.repository.name, name: chart.name, providers: [:gcp]}
      ]})
      deferred = insert(:deferred_update, chart_installation: chart_inst, version: version, user: user)

      :timer.sleep(:timer.seconds(6))

      refute refetch(deferred)
      assert refetch(chart_inst).version_id == version.id
      assert Core.Schema.Upgrade.for_queue(q.id)
             |> Core.Repo.exists?()
    end
  end
end
