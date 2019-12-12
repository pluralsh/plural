defmodule Watchman do
  def conf(key), do: Application.get_env(:watchman, key)

  def workspace(), do: Path.join(conf(:workspace_root), conf(:repo_root))

  def hmac(secret, payload) do
    :crypto.hmac(:sha, secret, payload)
    |> Base.encode16(case: :lower)
  end
end
