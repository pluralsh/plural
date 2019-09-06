defmodule Core.Services.ChartsTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Charts

  describe "#create_chart" do
    test "A user can create a chart if he's a publisher" do
      user = insert(:user)
      pub  = insert(:publisher, owner: user)

      {:ok, chart} = Charts.create_chart(%{name: "somechart", latest_version: "0.1.0"}, user)

      assert chart.name == "somechart"
      assert chart.publisher_id == pub.id
      assert chart.latest_version == "0.1.0"

      assert Charts.get_chart_version(chart.id, "0.1.0")
    end
  end

  describe "#create_version" do
    test "A user can create new versions of charts he owns" do
      user  = insert(:user)
      pub   = insert(:publisher, owner: user)
      chart = insert(:chart, publisher: pub)

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

  describe "#create_installation" do
    test "A user can install valid versions of a chart" do
      %{chart: chart} = insert(:version, version: "1.0.0")
      user = insert(:user)

      {:ok, installation} = Charts.create_installation(%{version: "1.0.0"}, chart.id, user)

      assert installation.version == "1.0.0"
      assert installation.user_id == user.id
      assert installation.chart_id == chart.id
    end

    test "Invalid chart versions are uninstallable" do
      %{chart: chart} = insert(:version, version: "1.0.0")
      user = insert(:user)

      {:error, _} = Charts.create_installation(%{version: "bogus"}, chart.id, user)
    end
  end
end