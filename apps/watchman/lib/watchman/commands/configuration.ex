defmodule Watchman.Commands.Configuration do
  use Task, restart: :transient
  import Watchman
  import Watchman.Commands.Command

  def start_link(_) do
    Task.start_link(__MODULE__, :run, [])
  end

  def run() do
    {:ok, _} = register_ssh_keys()
  end

  defp register_ssh_keys() do
    with ssh_key when is_binary(ssh_key) <- conf(:git_ssh_key) |> mkpath(),
      do: cmd("ssh-add", [ssh_key])
  end

  defp mkpath(:pass), do: {:ok, :pass}
  defp mkpath({:home, dir}), do: System.user_home!() |> Path.join(dir)
  defp mkpath(dir) when is_binary(dir), do: dir
end