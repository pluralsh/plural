defmodule Core.Services.ChartsTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Charts

  describe "#create_chart" do
    test "A user can create a chart if he's a publisher" do
      user = insert(:user)
      pub  = insert(:publisher, owner: user)
      repo = insert(:repository, publisher: pub)

      {:ok, chart} = Charts.create_chart(%{name: "somechart", latest_version: "0.1.0"}, repo.id, user)

      assert chart.name == "somechart"
      assert chart.repository_id == repo.id
      assert chart.latest_version == "0.1.0"

      assert Charts.get_chart_version(chart.id, "0.1.0")
    end
  end

  describe "#create_version" do
    test "A user can create new versions of charts he owns" do
      user  = insert(:user)
      pub   = insert(:publisher, owner: user)
      repo  = insert(:repository, publisher: pub)
      chart = insert(:chart, repository: repo)

      {:ok, version} = Charts.create_version(%{version: "1.1.0"}, chart.id, user)

      assert version.chart_id == chart.id
      assert version.version == "1.1.0"

      assert refetch(chart).latest_version == "1.1.0"
    end

    test "Non owners are forbidden" do
      user = insert(:user)
      chart = insert(:chart)

      {:error, _} = Charts.create_version(%{version: "1.0.0"}, chart.id, user)
    end
  end

  describe "#chart_installation" do
    test "A user can install valid versions of a chart" do
      %{chart: chart, id: vid} = insert(:version, version: "1.0.0")
      user = insert(:user)
      installation = insert(:installation, repository: chart.repository, user: user)

      {:ok, ci} = Charts.create_chart_installation(%{
        version_id: vid,
        chart_id: chart.id
      }, installation.id, user)

      assert ci.version_id == vid
      assert ci.chart_id == chart.id
      assert ci.installation_id == installation.id
    end

    test "If there is no installation of the chart's repo, it can't be installed" do
      %{chart: chart} = version = insert(:version, version: "1.0.0")
      user = insert(:user)
      installation = insert(:installation, user: user)

      {:error, _} = Charts.create_chart_installation(%{
        version_id: version.id,
        chart_id: chart.id
      }, installation.id, user)
    end

    test "If the version is invalid, it can't be installed" do
      %{chart: chart} = insert(:version, version: "1.0.0")
      user = insert(:user)
      installation = insert(:installation, repository: chart.repository, user: user)
      version = insert(:version)

      {:error, _} = Charts.create_chart_installation(%{
        version_id: version.id,
        chart_id: chart.id
      }, installation.id, user)
    end
  end

  describe "#sync_version" do
    test "It will add helm info onto a chart version" do
      version = insert(:version)

      {:ok, version} = Charts.sync_version(
        %{"description" => "some chart"},
        version.chart_id,
        version.version
      )

      assert version.helm == %{"description" => "some chart"}
    end
  end
end