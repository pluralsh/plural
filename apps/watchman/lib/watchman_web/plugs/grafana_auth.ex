defmodule WatchmanWeb.Plugs.GrafanaAuth do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    secret = Watchman.conf(:webhook_secret)
    fetch_cookies(conn)
    |> Map.get(:req_cookies)
    |> Map.new()
    |> case do
      %{"grafana_token" => ^secret} ->
        {user, pwd} = Watchman.Grafana.Token.fetch() |> IO.inspect()
        auth = Base.encode64("#{user}:#{pwd}")
        put_req_header(conn, "authorization", "Basic #{auth}")
      _ ->
        conn
        |> send_resp(401, "Not Authorized")
        |> halt()
    end
  end
end