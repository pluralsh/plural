defmodule Plural.MixProject do
  use Mix.Project

  defp version do
    version = git_vsn()
    case Version.parse(version) do
      {:ok, %Version{pre: ["pre" <> _ | _]} = version} ->
        to_string(version)

      {:ok, %Version{pre: []} = version} ->
        to_string(version)

      {:ok, %Version{patch: patch, pre: pre} = version} ->
        to_string(%{version | patch: patch + 1, pre: ["dev" | pre]})

      :error ->
        Mix.shell().error("Failed to parse, falling back to 0.0.0")
        "0.0.0"
    end
  end

  defp git_vsn() do
    case System.cmd("git", ~w[describe --dirty=+dirty]) do
      {version, 0} ->
        String.trim_leading(String.trim(version), "v")

      {_, code} ->
        Mix.shell().error("Git exited with code #{code}, falling back to 0.0.0")

        "0.0.0"
    end
  end

  def project do
    [
      apps_path: "apps",
      version: version(),
      elixir: "~> 1.16",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      releases: releases(),
      test_coverage: [tool: ExCoveralls],
      preferred_cli_env: [
        coveralls: :test,
        "coveralls.detail": :test,
        "coveralls.post": :test,
        "coveralls.html": :test
      ]
    ]
  end

  defp releases do
    [
      plural: [
        include_executables_for: [:unix],
        runtime_config_path: "rel/runtime.exs",
        overlays: "rel/overlays/plural",
        applications: [
          runtime_tools: :permanent,
          api: :permanent,
          core: :permanent,
          email: :permanent,
          graphql: :permanent
        ]
      ],
      rtc: [
        include_executables_for: [:unix],
        runtime_config_path: "rel/runtime.exs",
        applications: [
          runtime_tools: :permanent,
          rtc: :permanent,
          core: :permanent,
          graphql: :permanent
        ]
      ],
      worker: [
        include_executables_for: [:unix],
        runtime_config_path: "rel/runtime.exs",
        applications: [
          runtime_tools: :permanent,
          worker: :permanent,
          core: :permanent,
          email: :permanent
        ]
      ],
      cron: [
        include_executables_for: [:unix],
        runtime_config_path: "rel/runtime.exs",
        applications: [
          runtime_tools: :permanent,
          cron: :permanent,
          core: :permanent,
          email: :permanent
        ]
      ]
    ]
  end

  defp deps do
    [
      {:x509, "~> 0.9"},
      {:shards, "~> 1.1"},
      {:ecto, "~> 3.12.0", override: true},
      {:ecto_sql, "~> 3.12.0", override: true},
      {:postgrex, "~> 0.22", override: true},
      {:hackney, "~> 1.21", override: true},
      {:mint, "~> 1.9", override: true},
      {:tesla, "~> 1.18", override: true},
      {:bandit, "~> 1.12", override: true},
      {:jose, "~> 1.11", override: true},
      {:plug, "~> 1.18", override: true},
      {:plug_cowboy, "~> 2.8", override: true},
      {:cowboy, "~> 2.15", override: true},
      {:cowlib, "~> 2.16", override: true},
      {:absinthe, "~> 1.10", override: true},
      {:rabbit_common, "~> 4.2", override: true},
      {:absinthe_plug, "~> 1.5.8",
       git: "https://github.com/absinthe-graphql/absinthe_plug.git",
       commit: "3a984cc341ebb32c79e7ae58b4ebd116d5c62f9e",
       override: true},
      {:credo, "~> 1.7", only: [:dev, :test], runtime: false},
      {:sobelow, "~> 0.8", only: :dev},
      {:excoveralls, "~> 0.10", only: :test},
      {:junit_formatter, "~> 3.3", only: [:test]}
    ]
  end
end
