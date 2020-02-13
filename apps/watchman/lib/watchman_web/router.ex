defmodule WatchmanWeb.Router do
  use WatchmanWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  get "/health", WatchmanWeb.HealthController, :health

  scope "/v1", WatchmanWeb do
    pipe_through [:api]

    post "/webhook", WebhookController, :webhook
  end

  scope "/", WatchmanWeb do
    get "/", PageController, :index
    get "/*path", PageController, :index
  end
end
