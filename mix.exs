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
      test_coverage: [tool: ExCoveralls]
    ]
  end

  def cli do
    [
      preferred_envs: [
        coveralls: :test,
        "coveralls.detail": :test,
        "coveralls.post": :test,
        "coveralls.html": :test
      ]
    ]
  end

  defp releases do
    [
      plural: release(:plural, [
        runtime_tools: :permanent,
        api: :permanent,
        core: :permanent,
        email: :permanent,
        graphql: :permanent
      ]),
      rtc: release(:rtc, [
        runtime_tools: :permanent,
        rtc: :permanent,
        core: :permanent,
        graphql: :permanent
      ]),
      worker: release(:worker, [
        runtime_tools: :permanent,
        worker: :permanent,
        core: :permanent,
        email: :permanent
      ]),
      cron: release(:cron, [
        runtime_tools: :permanent,
        cron: :permanent,
        core: :permanent,
        email: :permanent
      ])
    ]
  end

  defp release(name, applications) do
    [
      include_executables_for: [:unix],
      runtime_config_path: "rel/runtime/#{name}.exs",
      applications: applications
    ]
  end

  defp deps do
    [
      {:ecto, "~> 3.13", override: true},
      {:decimal, "~> 3.0", override: true},
      {:hackney, "~> 4.0", override: true},
      {:poison, "~> 6.0", override: true},
      {:httpoison, "~> 3.0", github: "pluralsh/httpoison", branch: "fix-certs", commit: "75f6305ce8c89b39d12574008e596785d65d4d1c", override: true},
      {:x509, "~> 0.9.2"},
      {:req, "~> 0.7.2", override: true},
      {:shards, "~> 1.0"},
      {:goth, "~> 1.4", git: "https://github.com/pluralsh/goth.git", branch: "plrl-cleanup", commit: "4958159d1e9acec2154590ecacc732ecd58f8312", override: true},
      {:absinthe_plug, "~> 1.5", git: "https://github.com/absinthe-graphql/absinthe_plug.git", commit: "3a984cc341ebb32c79e7ae58b4ebd116d5c62f9e", override: true},
      {:credo, "~> 1.6", only: [:dev, :test], runtime: false},
      {:sobelow, "~> 0.8", only: :dev},
      {:excoveralls, "~> 0.10", only: :test},
      {:junit_formatter, "~> 3.3", only: [:test]}
    ]
  end
end
