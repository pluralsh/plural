defmodule GraphQl.ChartMutationsTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "installChart" do
    test "A user can install a chart" do
      %{user: user, repository: repo} = inst = insert(:installation)
      chart = insert(:chart, repository: repo)
      version = insert(:version, chart: chart)

      {:ok, %{data: %{"installChart" => ci}}} = run_query("""
        mutation InstallChart($instId: ID!, $attrs: ChartInstallationAttributes!) {
          installChart(installationId: $instId, attributes: $attrs) {
            id
            version {
              id
            }
          }
        }
      """, %{"instId" => inst.id, "attrs" => %{"chartId" => chart.id, "versionId" => version.id}},
      %{current_user: user})

      assert ci["version"]["id"] == version.id
    end
  end

  describe "updateChartInstallation" do
    test "A user can update their installations" do
      %{user: user, repository: repo} = inst = insert(:installation)
      chart = insert(:chart, repository: repo)
      version = insert(:version, chart: chart)
      ci = insert(:chart_installation, chart: chart, version: version, installation: inst)
      v2 = insert(:version, chart: chart, version: "2.0")

      {:ok, %{data: %{"updateChartInstallation" => updated}}} = run_query("""
        mutation UpdateChartInstallation($id: ID!, $attrs: ChartInstallationAttributes!) {
          updateChartInstallation(chartInstallationId: $id, attributes: $attrs) {
            id
            version {
              id
            }
          }
        }
      """, %{"id" => ci.id, "attrs" => %{"versionId" => v2.id}},
      %{current_user: user})

      assert updated["id"] == ci.id
      assert updated["version"]["id"] == v2.id
    end
  end
end