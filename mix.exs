defmodule Plural.MixProject do
  use Mix.Project

  @vsn File.read!("VERSION")

  def project do
    [
      apps_path: "apps",
      version: @vsn,
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  defp deps do
    [
      {:distillery, "~> 2.1"},
      {:x509, "~> 0.8.0"},
      {:ecto, "~> 3.3.2", override: true},
      {:absinthe_plug, "~> 1.5.0", override: true},
    ]
  end
end
