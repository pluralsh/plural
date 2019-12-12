defmodule WatchmanWeb.HealthControllerTest do
  use WatchmanWeb.ConnCase

  describe "#health/2" do
    test "it'll succeed", %{conn: conn} do
      path = Routes.health_path(conn, :health)

      get(conn, path)
      |> json_response(200)
    end
  end
end
