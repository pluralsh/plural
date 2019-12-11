defmodule Watchman.Chartmart do
  import Watchman
  import Watchman.Command, only: [cmd: 3]

  def init(), do: chartmart("import", [conf(:chartmart_config)])

  def unlock(), do: chartmart("crypto", ["unlock"])

  def build(repo), do: chartmart("build", [repo])

  def deploy(repo), do: chartmart("deploy", [repo])

  def chartmart(command, args), do: cmd("chartmart", [command | args], workspace())
end