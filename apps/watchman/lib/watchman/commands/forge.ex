defmodule Watchman.Commands.Forge do
  import Watchman
  import Watchman.Commands.Command, only: [cmd: 3]

  def unlock() do
    with {:ok, _} <- forge("crypto", ["init"]),
      do: forge("crypto", ["unlock"])
  end

  def build(repo), do: forge("build", ["--only", repo])

  def deploy(repo), do: forge("deploy", [repo])

  def bounce(repo), do: forge("bounce", [repo])

  def forge(command, args), do: cmd("forge", [command | args], workspace())
end