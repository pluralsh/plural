defmodule ApiWeb.Plugs.AuditContextTest do
  use ApiWeb.ConnCase, async: true
  alias ApiWeb.Plugs.AuditContext

  describe "#call/2" do
    test "it can set audit context", %{conn: conn} do
      conn
      |> Map.put(:remote_ip, {1, 2, 3, 4})
      |> put_req_header("geoip-country-code", "US")
      |> put_req_header("geoip-city", "New York")
      |> put_req_header("geoip-latitude", "134")
      |> put_req_header("geoip-longitude", "324")
      |> AuditContext.call([])

      ctx = Core.Services.Audits.context()

      assert ctx.ip        == "1.2.3.4"
      assert ctx.country   == "US"
      assert ctx.city      == "New York"
      assert ctx.latitude  == "134"
      assert ctx.longitude == "324"
    end
  end
end
