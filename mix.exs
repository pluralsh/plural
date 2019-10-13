defmodule Chartmart.MixProject do
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
      {:distillery, "~> 2.1"}
    ]
  end
end
