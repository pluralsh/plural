defmodule ApiWeb.InstallationControllerTest do
  use ApiWeb.ConnCase, async: true

  describe "#create/2" do
    test "Users can create installations of charts", %{conn: conn} do
      %{chart: chart, version: version} = insert(:version)
      path = Routes.installation_path(conn, :create)
      user = insert(:user)

      result =
        conn
        |> authorized(user)
        |> post(path, %{version: version, chart_id: chart.id})
        |> json_response(200)

      assert result["user_id"] == user.id
      assert result["chart_id"] == chart.id
      assert result["version"] == version
    end
  end

  describe "#token/2" do
    test "Users can generate a token for their installations", %{conn: conn} do
      %{user: user} = inst = insert(:installation)
      path = Routes.installation_installation_path(conn, :token, inst.id)

      %{"access_token" => access_token} =
        conn
        |> authorized(user)
        |> get(path)
        |> json_response(200)

      {:ok, _} = Core.ChartMuseum.Token.verify(access_token)
    end
  end
end