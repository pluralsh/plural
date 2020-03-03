defmodule WatchmanWeb.Plugs.AuthorizedTest do
  use WatchmanWeb.ConnCase, async: true
  alias WatchmanWeb.Plugs.Authorized

  describe "#call/2" do
    test "It will validate against the configured webhook token, and set the grafana_token cookie", %{conn: conn} do
      secret = Watchman.conf(:webhook_secret)
      conn = put_req_header(conn, "authorization", "Bearer #{secret}")
      result = Authorized.call(conn, [])

      refute result.status == 401
      %{"grafana_token" => %{value: val}} = result.resp_cookies

      assert val == Base.encode64(secret, padding: false)
    end
  end
end