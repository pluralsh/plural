defmodule WatchmanWeb.Router do
  use WatchmanWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  get "/health", WatchmanWeb.HealthController, :health

  scope "/watchman", WatchmanWeb do
    pipe_through [:api]

    post "/webhook", WebhookController, :webhook
  end
end
