defmodule ApiWeb.ChartControllerTest do
  use ApiWeb.ConnCase, async: true

  describe "#create/2" do
    test "Publisher owners can create charts", %{conn: conn} do
      %{owner: user} = pub = insert(:publisher)
      repo = insert(:repository, publisher: pub)
      path = Routes.chart_path(conn, :create)

      result =
        conn
        |> authorized(user)
        |> post(path, %{name: "mychart", latest_version: "0.1.0", repository_id: repo.id})
        |> json_response(200)

      assert result["name"] == "mychart"
      assert result["repository_id"] == repo.id
      assert result["latest_version"] == "0.1.0"
    end
  end

  describe "#version/2" do
    test "publishers can version charts", %{conn: conn} do
      chart = insert(:chart)
      path = Routes.chart_chart_path(conn, :version, chart.id)

      result =
        conn
        |> authorized(chart.repository.publisher.owner)
        |> post(path, %{version: "1.0.0"})
        |> json_response(200)

      assert result["chart_id"] == chart.id
      assert result["version"] == "1.0.0"
    end
  end
end