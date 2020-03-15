defmodule WatchmanWeb.Plugs.Authorized do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    ["Bearer " <> secret] = get_req_header(conn, "authorization")
    [_ | rest] = Watchman.conf(:url) |> String.split(".")

    put_resp_cookie(
      conn,
      "grafana_token",
      secret,
      http_only: false,
      secure: false,
      domain: Enum.join(rest, ".")
    )
  end
end