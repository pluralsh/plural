defmodule Plural.MixProject do
  use Mix.Project

  defp version do
    case :file.consult('hex_metadata.config') do
      {:ok, data} ->
        {"version", version} = List.keyfind(data, "version", 0)
        version
      _ ->
        version =
          case System.cmd("git", ~w[describe --dirty=+dirty]) do
            {version, 0} ->
              String.trim_leading(String.trim(version), "v")

            {_, code} ->
              Mix.shell().error("Git exited with code #{code}, falling back to 0.0.0")

              "0.0.0"
          end

        case Version.parse(version) do
          {:ok, %Version{pre: ["pre" <> _ | _]} = version} ->
            to_string(version)

          {:ok, %Version{pre: []} = version} ->
            to_string(version)

          {:ok, %Version{patch: patch, pre: pre} = version} ->
            to_string(%{version | patch: patch + 1, pre: ["dev" | pre]})

          :error ->
            Mix.shell().error("Failed to parse #{version}, falling back to 0.0.0")

            "0.0.0"
        end
    end
  end

  def project do
    [
      apps_path: "apps",
      version: version(),
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  defp deps do
    [
      {:distillery, "~> 2.1"},
      {:x509, "~> 0.7.0"},
      {:ecto, "~> 3.3.2", override: true},
      {:hackney, "~> 1.18.0", override: true},
      {:absinthe_plug, "~> 1.5.0", override: true},
    ]
  end
end
