defmodule Watchman.Commands.Chartmart do
  import Watchman
  import Watchman.Commands.Command, only: [cmd: 3]

  def unlock() do
    with {:ok, _} <- chartmart("crypto", ["init"]),
      do: chartmart("crypto", ["unlock"])
  end

  def build(repo), do: chartmart("build", ["--only", repo])

  def deploy(repo), do: chartmart("deploy", [repo])

  def bounce(repo), do: chartmart("bounce", [repo])

  def chartmart(command, args), do: cmd("chartmart", [command | args], workspace())
end