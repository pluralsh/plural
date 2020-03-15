defmodule WatchmanWeb.Plugs.Authorized do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    [_ | rest] = Watchman.conf(:url) |> String.split(".")

    case get_req_header(conn, "authorization") do
      ["Bearer " <> secret] -> add_cookie(conn, secret, Enum.join(rest, "."))
      _ -> conn
    end
  end

  defp add_cookie(conn, secret, domain) do
    put_resp_cookie(
      conn,
      "grafana_token",
      secret,
      http_only: false,
      secure: false,
      domain: domain
    )
  end
end