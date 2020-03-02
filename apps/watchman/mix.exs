defmodule Watchman.MixProject do
  use Mix.Project

  def project do
    [
      app: :watchman,
      version: "0.1.0",
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.9",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: [:phoenix, :gettext] ++ Mix.compilers(),
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      mod: {Watchman.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:ecto_sql, "~> 3.0"},
      {:ecto, "~> 3.3.2", override: true},
      {:ex_machina, "~> 2.3", only: :test},
      {:postgrex, ">= 0.0.0"},
      {:phoenix, "~> 1.4.9"},
      {:phoenix_pubsub, "~> 1.1"},
      {:phoenix_ecto, "~> 4.0"},
      {:ecto_sql, "~> 3.1"},
      {:piazza_core, "~> 0.2.7"},
      {:flow, "~> 0.15.0"},
      {:bourne, "~> 1.1"},
      {:postgrex, ">= 0.0.0"},
      {:phoenix_html, "~> 2.11"},
      {:phoenix_live_reload, "~> 1.2", only: :dev},
      {:gettext, "~> 0.11"},
      {:jason, "~> 1.0"},
      {:plug_cowboy, "~> 2.0"},
      {:porcelain, "~> 2.0"},
      {:absinthe, "~> 1.4.6"},
      {:absinthe_relay, "~> 1.4.6"},
      {:absinthe_plug, "~> 1.4.0"},
      {:absinthe_phoenix, "~> 1.4.0"},
      {:dataloader, "~> 1.0.0"},
      {:cors_plug, "~> 2.0"},
      {:timex, "~> 3.6"},
      {:quantum, "~> 2.3"},
      {:yaml_elixir, "~> 2.4"},
      {:poison, "~> 3.1"},
      {:mojito, "~> 0.3.0"},
      {:reverse_proxy_plug, "~> 1.2.1"},
      {:kazan, "~> 0.11"}
    ]
  end
end
