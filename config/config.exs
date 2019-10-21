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

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :phoenix, :json_library, Jason

config :core, Core.Guardian,
  issuer: "chartmart",
  secret_key: "chartmart_secret"

config :core, :chartmuseum, "http://localhost:8080"

config :botanist,
  ecto_repo: Core.Repo

config :arc,
  storage: Arc.Storage.GCS,
  bucket: "chartmart-assets"

import_config "#{Mix.env()}.exs"
