defmodule WatchmanWeb.Plugs.Authorized do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    secret = Watchman.conf(:webhook_secret)
    [_ | rest] = Watchman.conf(:url) |> String.split(".")

    case get_req_header(conn, "authorization") do
      ["Bearer " <> ^secret] ->
          put_resp_cookie(
            conn,
            "grafana_token",
            Base.encode64(secret, padding: false),
            http_only: false,
            secure: false,
            domain: Enum.join(rest, ".")
          )
      _ -> send_resp(conn, 401, "Not Authorized") |> halt()
    end
  end
end