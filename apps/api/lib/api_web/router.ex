defmodule ApiWeb.Router do
  use ApiWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :auth do
    plug ApiWeb.GuardianPipeline
    plug ApiWeb.Plugs.AbsintheContext
  end

  forward "/graphiql", Absinthe.Plug.GraphiQL,
      schema: GraphQl,
      interface: :playground,
      default_url: {Api, :graphql_endpoint},
      socket_url: {Api, :socket_endpoint}

  scope "/gql" do
    pipe_through [:api, :auth]

    forward "/", Absinthe.Plug,
      schema: GraphQl,
      document_providers: [GraphQl.APQ, Absinthe.Plug.DocumentProvider.Default],
      analyze_complexity: true,
      max_complexity: 500,
      token_limit: 5_000
  end

  scope "/", ApiWeb do
    pipe_through :api

    get "/auth/token", AuthController, :token
    post "/auth/token", AuthController, :post_token
    post "/auth/license", AuthController, :refresh_license

    get "/health", HealthController, :ping

    post "/signup", UserController, :create
    post "/login", UserController, :login

    post "/dkr/callback", DockerController, :events

    get "/artifacts/:repository/:name", ArtifactController, :show

    scope "/webhooks" do
      post "/workos", WebhookController, :workos
      post "/stripe", WebhookController, :stripe
    end
  end

  scope "/api", ApiWeb do
    pipe_through :api

    post "/email", EmailController, :email

    get "/license/:key", LicenseController, :get
  end

  scope "/mart", ApiWeb do
    pipe_through [:api, :auth]

    get "/me", UserController, :me

    post "/publishers", UserController, :create_publisher

    resources "/charts", ChartController, only: [:create] do
      post "/version", ChartController, :version
      get "/token", ChartController, :token
    end

    resources "/installations", InstallationController, only: [:create] do
      get "/token", InstallationController, :token
    end
  end

  scope "/cm", ApiWeb do
    pipe_through [:auth]

    get "/:repo/index.yaml", ChartMuseumController, :index_db
    get "/:repo/charts/:chart", ChartMuseumController, :get

    scope "/api" do
      post "/:repo/charts", ChartMuseumController, :create_chart
      post "/:repo/prov", ChartMuseumController, :create_prov
      delete "/:repo/charts/:name/:version", ChartMuseumController, :delete

      get "/:repo/charts", ChartMuseumController, :list
      get "/:repo/charts/:chart", ChartMuseumController, :list_versions
      get "/:repo/charts/:chart/:version", ChartMuseumController, :get_version
    end
  end
end
