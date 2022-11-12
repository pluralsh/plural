defmodule Worker.MixProject do
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
      app: :worker,
      version: version(),
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.11",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger],
      mod: {Worker.Application, []}
    ]
  end

  defp deps do
    [
      {:k8s_traffic_plug, github: "Financial-Times/k8s_traffic_plug"},
      {:core, in_umbrella: true},
      {:email, in_umbrella: true}
    ]
  end
end
