defmodule RtcWeb.Router do
  use RtcWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", RtcWeb do
    pipe_through :api

    get "/health", PageController, :health
  end

  # Other scopes may use custom stacks.
  # scope "/api", RtcWeb do
  #   pipe_through :api
  # end
end
