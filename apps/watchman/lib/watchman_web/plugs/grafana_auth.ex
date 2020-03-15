defmodule WatchmanWeb.Plugs.GrafanaAuth do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    fetch_cookie(conn)
    |> Watchman.Guardian.decode_and_verify()
    |> case do
      {:ok, _} ->
        {user, pwd} = Watchman.Grafana.Token.fetch()
        auth = Base.encode64("#{user}:#{pwd}")
        put_req_header(conn, "authorization", "Basic #{auth}")
      _ ->
        conn
        |> send_resp(401, "Not Authorized")
        |> halt()
    end
  end

  defp fetch_cookie(conn) do
    fetch_cookies(conn)
    |> Map.get(:req_cookies)
    |> Map.new()
    |> case do
      %{"grafana_token" => token} -> token
      _ -> "bogus"
    end
  end
end