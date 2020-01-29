use Mix.Config

config :core,
  ecto_repos: [Core.Repo]

config :piazza_core,
  repos: [Core.Repo]

config :api, ApiWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "1rkd5+lxJbdTadyxW7qF/n1fNzKPV010PKf8SEGmUrXwMw0iAZyoyZgWEwr6nmCJ",
  render_errors: [view: ApiWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Api.PubSub, adapter: Phoenix.PubSub.PG2],
  server: true

config :watchman, WatchmanWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "1rkd5+lxJbdTadyxW7qF/n1fNzKPV010PKf8SEGmUrXwMw0iAZyoyZgWEwr6nmCJ",
  render_errors: [view: WatchmanWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Watchman.PubSub, adapter: Phoenix.PubSub.PG2],
  server: true

config :watchman,
  git_user_name: "chartmart",
  git_user_email: "chartmart@piazzaapp.com"

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :phoenix, :json_library, Jason

config :core, Core.Guardian,
  issuer: "chartmart",
  secret_key: "chartmart_secret"

config :core, :chartmuseum, "http://localhost:8080"

config :core, Core.Services.Payments,
  application_fee: 5

config :botanist,
  ecto_repo: Core.Repo

config :arc,
  storage: Arc.Storage.GCS,
  bucket: "chartmart-assets"

config :stripity_stripe,
  hackney_opts: [connect_timeout: 5000, recv_timeout: 60_000]

config :core, Core.Email.Mailer,
  adapter: Bamboo.LocalAdapter


import_config "#{Mix.env()}.exs"
