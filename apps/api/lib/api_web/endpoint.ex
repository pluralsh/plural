defmodule ApiWeb.Endpoint do
  use Sentry.PlugCapture
  use Phoenix.Endpoint, otp_app: :api

  @upload_maximum 75_000_000

  socket "/socket", ApiWeb.UserSocket,
    websocket: true,
    longpoll: false

  # Serve at "/" the static files from "priv/static" directory.
  #
  # You should set gzip to true if you are running phx.digest
  # when deploying your static files in production.
  plug Plug.Static,
    at: "/",
    from: :api,
    gzip: false,
    only: ~w(css fonts images js favicon.ico robots.txt)

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    socket "/phoenix/live_reload/socket", Phoenix.LiveReloader.Socket
    plug Phoenix.LiveReloader
    plug Phoenix.CodeReloader
  end

  plug CORSPlug
  plug ApiWeb.Plugs.RemoteIp
  plug ApiWeb.Plugs.AuditContext

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, {:multipart, length: @upload_maximum}, ApiWeb.Parsers.ApplicationJson],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library(),
    body_reader: {ApiWeb.CacheBodyReader, :read_body, []}

  plug Sentry.PlugContext
  plug Plug.MethodOverride
  plug Plug.Head
  plug ApiWeb.Plugs.MetricsExporter

  # The session will be stored in the cookie and signed,
  # this means its contents can be read but not tampered with.
  # Set :encryption_salt if you would also like to encrypt it.
  plug Plug.Session,
    store: :cookie,
    key: "_api_key",
    signing_salt: "T9YbiJWj"

  plug FT.K8S.TrafficDrainPlug

  plug ApiWeb.Router
end
