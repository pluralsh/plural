defmodule WatchmanWeb.Plugs.Authorized do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    secret = Watchman.conf(:webhook_secret)
    case get_req_header(conn, "authorization") do
      ["Bearer " <> ^secret] -> conn
      _ -> send_resp(conn, 401, "Not Authorized") |> halt()
    end
  end
end