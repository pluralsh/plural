defmodule EmailWeb.Router do
  use EmailWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", EmailWeb do
    pipe_through :browser

    get "/", PageController, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", EmailWeb do
  #   pipe_through :api
  # end

  if Application.fetch_env!(:core, :env) in [:dev, :test] do
    forward "/sent_emails", Bamboo.SentEmailViewerPlug
  end
end
