defmodule WatchmanWeb.GuardianPipeline do
  use Guardian.Plug.Pipeline, otp_app: :api,
                              module: Watchman.Guardian,
                              error_handler: WatchmanWeb.Plug.AuthErrorHandler

  plug Guardian.Plug.VerifySession
  plug Guardian.Plug.VerifyHeader, realm: "Bearer"
  # plug Guardian.Plug.EnsureAuthenticated
  plug Guardian.Plug.LoadResource, allow_blank: true
end