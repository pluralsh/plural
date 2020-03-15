defmodule WatchmanWeb.Plugs.AuthorizedTest do
  use WatchmanWeb.ConnCase, async: true
  alias WatchmanWeb.Plugs.Authorized

  describe "#call/2" do
    test "It will validate against the configured webhook token, and set the grafana_token cookie", %{conn: conn} do
      user = insert(:user)
      conn = add_auth_headers(conn, user)
      result = Authorized.call(conn, [])

      refute result.status == 401
      %{"grafana_token" => %{value: val}} = result.resp_cookies

      {:ok, _} = Watchman.Guardian.decode_and_verify(val)
    end
  end
end