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
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      test_coverage: [tool: ExCoveralls],
      preferred_cli_env: [
        coveralls: :test,
        "coveralls.detail": :test,
        "coveralls.post": :test,
        "coveralls.html": :test
      ],
      releases: releases()
    ]
  end

  defp releases() do
    [
      plural: [
        include_executables_for: [:unix],
        include_erts: true,
        strip_beams: true,
        quiet: false,
        config_providers: [
          {Config.Reader, {:system, "RELEASE_ROOT", "apps/core/config/runtime.exs"}},
        ],
        steps: [:assemble, &copy_configs/1],
        applications: [
          api: :permanent,
          core: :permanent,
          email: :permanent,
          graphql: :permanent
        ]
      ],
      rtc: [
        include_executables_for: [:unix],
        include_erts: true,
        strip_beams: true,
        quiet: false,
        config_providers: [
          {Config.Reader, {:system, "RELEASE_ROOT", "apps/rtc/config/runtime.exs"}},
        ],
        steps: [:assemble, &copy_configs/1],
        applications: [
          rtc: :load,
          core: :permanent,
          graphql: :load
        ]
      ],
      worker: [
        include_executables_for: [:unix],
        include_erts: true,
        strip_beams: true,
        quiet: false,
        config_providers: [
          {Config.Reader, {:system, "RELEASE_ROOT", "apps/worker/config/runtime.exs"}},
        ],
        steps: [:assemble, &copy_configs/1],
        applications: [
          worker: :permanent,
          core: :permanent
        ]
      ],
      cron: [
        include_executables_for: [:unix],
        include_erts: true,
        strip_beams: true,
        quiet: false,
        config_providers: [
          {Config.Reader, {:system, "RELEASE_ROOT", "apps/cron/config/runtime.exs"}},
        ],
        steps: [:assemble, &copy_configs/1],
        applications: [
          cron: :permanent,
          core: :permanent,
          email: :permanent
        ]
      ],
    ]
  end

  defp copy_configs(%{path: path, config_providers: config_providers} = release) do
    for {_module, {_context, _root, file_path}} <- config_providers do
      # Creating new path
      new_path = path <> "/" <> Path.dirname(file_path)
      # Removing possible leftover files from previous builds
      File.rm_rf!(new_path)
      # Creating directory if it doesn't exist
      File.mkdir_p!(new_path)
      # Copying files to the directory with the same name
      File.cp!(Path.expand(file_path), new_path <> "/" <> Path.basename(file_path))
    end

    release
  end

  defp deps do
    [
      {:x509, "~> 0.8.5"},
      {:shards, "~> 1.0"},
      {:ecto, "~> 3.9.0", override: true},
      {:hackney, "~> 1.18.1", override: true},
      {:absinthe_plug, "~> 1.5.8"},
      {:credo, "~> 1.6", only: [:dev, :test], runtime: false},
      {:sobelow, "~> 0.8", only: :dev},
      {:excoveralls, "~> 0.10", only: :test},
      {:junit_formatter, "~> 3.3", only: [:test]}
    ]
  end
end
