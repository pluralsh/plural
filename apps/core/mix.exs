defmodule Core.MixProject do
  use Mix.Project

  def project do
    [
      app: :core,
      version: "0.1.0",
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.9",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      mod: {Core.Application, []},
      extra_applications: [:logger, :crypto, :porcelain]
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:sentry, "8.0.6"},
      {:ecto_sql, "~> 3.7.0"},
      {:ecto, "~> 3.3.2", override: true},
      {:postgrex, ">= 0.0.0"},
      {:ex_machina, "~> 2.3", only: :test},
      {:comeonin, "~> 5.1.2"},
      {:argon2_elixir, "~> 2.0"},
      {:piazza_core, "~> 0.3.2"},
      {:bamboo, "~> 2.0"},
      {:parallax, "~> 1.0"},
      {:bourne, "~> 1.1"},
      {:flow, "~> 0.15.0"},
      {:joken, "~> 2.1.0"},
      {:guardian, "~> 1.2.1"},
      {:arc, "~> 0.11.0"},
      {:arc_gcs, "~> 0.1.0"},
      {:porcelain, "~> 2.0"},
      {:ex_aws, "~> 2.1"},
      {:ex_aws_s3, "~> 2.0"},
      {:ex_aws_sts, "~> 2.0"},
      {:configparser_ex, "~> 4.0"},
      {:sweet_xml, "~> 0.6"},
      {:arc_ecto, "~> 0.11.1"},
      {:mojito, "~> 0.3.0"},
      {:nebulex, "2.0.0-rc.1"},
      {:decorator, "~> 1.3"},   #=> For using Caching Annotations
      {:botanist, "~> 0.1.0", git: "https://github.com/michaeljguarino/botanist.git", branch: "ecto3"},
      {:x509, "~> 0.7.0"},
      {
        :briefly,
        git: "https://github.com/CargoSense/briefly",
        ref: "b0fd495bf0c5ef2c44de2791a8cc7a20813c7d36"
      },
      {:yaml_elixir, "~> 2.4"},
      {:timex, "~> 3.6"},
      {:oauth2, "~> 2.0"},
      {:tzdata, "~> 0.1.8", override: true},
      {:prometheus_ex, "~> 3.0"},
      {:stripity_stripe, "~> 2.7"},
      {:conduit, "~> 0.12"},
      {:conduit_amqp, "~> 0.6.3"},
      {:mime, "~> 1.2"},
      {:ex_image_info, "~> 0.2.4"},
      {:instream, "~> 1.0"},
      {:swarm, "~> 3.4.0"},
      {:poison, "~> 3.0"},
      {:cloudflare, "~> 0.2"},
      {:mint, "~> 1.0", override: true},
      {:mimic, "~> 1.1", only: :test}
    ]
  end

  defp aliases do
    [
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate", "test"]
    ]
  end
end
