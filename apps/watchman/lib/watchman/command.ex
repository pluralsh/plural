defmodule Watchman.Command do
  import Watchman

  def cmd(exec, args, dir \\ conf(:workspace_root)) do
    case System.cmd(exec, args, into: IO.stream(:stdio, :line), cd: dir) do
      {_, 0} -> :ok
      _ -> {:error, exec}
    end
  end
end