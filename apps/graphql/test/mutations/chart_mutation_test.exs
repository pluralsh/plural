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

  describe "updateChart" do
    test "it can update a chart's tags" do
      user  = insert(:user)
      pub   = insert(:publisher, owner: user)
      repo  = insert(:repository, publisher: pub)
      chart = insert(:chart, repository: repo)
      version = insert(:version, chart: chart, version: "1.1.0")

      {:ok, %{data: %{"updateChart" => updated}}} = run_query("""
        mutation UpdateChart($attrs: ChartAttributes!, $id: ID!) {
          updateChart(attributes: $attrs, id: $id) {
            id
            tags {
              version {
                id
              }
              tag
            }
          }
        }
      """,
      %{"id" => chart.id, "attrs" => %{"tags" => [%{"versionId" => version.id, "tag" => "stable"}]}},
      %{current_user: user})

      assert updated["id"] == chart.id
      assert hd(updated["tags"])["version"]["id"] == version.id
      assert hd(updated["tags"])["tag"] == "stable"
    end
  end

  describe "createCrd" do
    test "It can create a crd for a chart" do
      %{owner: user} = pub = insert(:publisher)
      repo = insert(:repository, publisher: pub)
      chart = insert(:chart, repository: repo, latest_version: "1.0")
      insert(:version, chart: chart, version: "1.0")

      {:ok, %{data: %{"createCrd" => create}}} = run_query("""
        mutation CreateCrd($attrs: CrdAttributes!, $id: ID!) {
          createCrd(attributes: $attrs, chartId: $id) {
            id
            name
          }
        }
      """, %{"id" => chart.id, "attrs" => %{"name" => "example.yaml"}}, %{current_user: user})

      assert create["id"]
      assert create["name"] == "example.yaml"
    end

    test "It can create a crd for a chart by chart name" do
      %{owner: user} = pub = insert(:publisher)
      repo = insert(:repository, publisher: pub)
      chart = insert(:chart, repository: repo, latest_version: "1.0")
      insert(:version, chart: chart, version: "1.0")

      {:ok, %{data: %{"createCrd" => create}}} = run_query("""
        mutation CreateCrd($attrs: CrdAttributes!, $chartName: ChartName!) {
          createCrd(attributes: $attrs, chartName: $chartName) {
            id
            name
          }
        }
      """,
      %{"chartName" => %{"repo" => repo.name, "chart" => chart.name}, "attrs" => %{"name" => "example.yaml"}},
      %{current_user: user})

      assert create["id"]
      assert create["name"] == "example.yaml"
    end
  end

  describe "updateVersion" do
    test "it can update a chart's tags" do
      user  = insert(:user)
      pub   = insert(:publisher, owner: user)
      repo  = insert(:repository, publisher: pub)
      chart = insert(:chart, repository: repo)
      version = insert(:version, chart: chart, version: "1.1.0")

      {:ok, %{data: %{"updateVersion" => updated}}} = run_query("""
        mutation updateVersion($attrs: VersionAttributes!, $id: ID!) {
          updateVersion(attributes: $attrs, id: $id) {
            id
            tags {
              version {
                id
              }
              chart {
                id
              }
              tag
            }
          }
        }
      """,
      %{"id" => version.id, "attrs" => %{"tags" => [%{"tag" => "stable"}]}},
      %{current_user: user})

      assert updated["id"] == version.id
      assert hd(updated["tags"])["version"]["id"] == version.id
      assert hd(updated["tags"])["chart"]["id"] == chart.id
      assert hd(updated["tags"])["tag"] == "stable"
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