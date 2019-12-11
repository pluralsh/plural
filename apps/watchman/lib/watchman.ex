defmodule Watchman do
  def conf(key), do: Application.get_env(:watchman, key)

  def workspace(), do: Path.join(conf(:workspace_root), conf(:repo_root))
end
