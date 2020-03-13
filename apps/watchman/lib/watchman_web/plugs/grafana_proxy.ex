defmodule WatchmanWeb.Plugs.GrafanaProxy do
  import Plug.Conn
  alias WatchmanWeb.Plugs.GrafanaAuth

  def init(_opts), do: ReverseProxyPlug.init(upstream: "http://bootstrap-grafana")

  def call(%{host: "watchman-grafana." <> _} = conn, opts) do
    with %{halted: false} = conn <- GrafanaAuth.call(conn, opts),
      do: ReverseProxyPlug.call(conn, opts) |> halt()
  end
  def call(conn, _), do: conn
end