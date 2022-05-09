defmodule Graphql.MixProject do
  use Mix.Project

  def project do
    [
      app: :graphql,
      version: "0.1.0",
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.9",
      start_permanent: Mix.env() == :prod,
      elixirc_paths: elixirc_paths(Mix.env()),
      deps: deps()
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger]
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:absinthe, "~> 1.7.0"},
      {:absinthe_relay, "~> 1.5.0"},
      {:absinthe_plug, "~> 1.5.0", override: true},
      {:dataloader, "== 1.0.6", override: true},
      {:apq, "~> 1.2.1"},

      {:core, in_umbrella: true}
    ]
  end
end
