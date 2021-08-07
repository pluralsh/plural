defmodule ApiWeb.Plugs.AuditContext do
  import Plug.Conn
  alias Core.Schema.AuditContext
  alias Core.Services.Audits

  def init(opts), do: opts

  def call(conn, _) do
    Audits.set_context(%AuditContext{
      ip: to_string(:inet.ntoa(conn.remote_ip)),
      city: fetch_header(conn, "geoip-city"),
      country: fetch_header(conn, "geoip-country-code"),
      latitude: fetch_header(conn, "geoip-latitude"),
      longitude: fetch_header(conn, "geoip-longitude")
    })
    conn
  end

  defp fetch_header(conn, header) do
    get_req_header(conn, header)
    |> IO.inspect()
    |> case do
      [h | _] -> h
      _ -> nil
    end
  end
end
