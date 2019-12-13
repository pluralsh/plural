defmodule Watchman.Configuration do
  import Watchman
  use Task, restart: :transient

  def start_link(_) do
    Task.start_link(__MODULE__, :run, [])
  end

  def run() do
    :ok = copy_rsa_keys()
  end

  defp copy_rsa_keys() do
    src  = conf(:git_ssh_key_source)
    dest = conf(:git_ssh_key_destination) |> mkpath()
    basename = Path.basename(src)

    with :ok <- File.cp(src, Path.join(dest, basename)),
      do: File.cp(src <> ".pub", Path.join(dest, basename <> ".pub"))
  end

  defp mkpath({:home, dir}), do: System.user_home!() |> Path.join(dir)
  defp mkpath(dir) when is_binary(dir), do: dir
end