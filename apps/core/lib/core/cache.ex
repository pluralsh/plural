defmodule Core.Cache do
  @moduledoc """
  In-process, distributed caching using nebulex (ets + dist erlang).

  Also enhanced with a few basic utilities for our use-case
  """
  use Nebulex.Cache,
    otp_app: :core,
    adapter: Nebulex.Adapters.Dist

  defmodule Local do
    use Nebulex.Cache,
      otp_app: :core,
      adapter: Nebulex.Adapters.Local
  end

  @max_list_cache 1000

  @doc """
  Pseudo-intelligent list caching.  Will run a count query to validate
  less than 1k elements will be returned, if so it will cache, otherwise
  it will bypass and return a stream for the given query.
  """
  @spec list_cache(Ecto.Queryable.t, term) :: term
  def list_cache(query, key) do
    case fetch(key, fn -> list_fallback(query) end) do
      {:ok, val} -> val
      {:commit, val} -> val
      _ -> Core.Repo.stream(query, method: :keyset)
    end
  end

  def fetch(key, fallback) do
    transaction(fn ->
      with {:ok, nil} <- {:ok, get(key)},
           {:commit, val} <- fallback.(),
        do: {:commit, set(key, val)}
    end)
  end

  @doc """
  Fetches the result at `key`, passes it to `fun` then saves
  it back to cache at the same key
  """
  @spec refresh(binary, function) :: {:ok, term} | {:error, term}
  def refresh(key, fun) do
    case get(key) do
      nil -> nil
      val -> set(key, fun.(val))
    end
  end

  defp list_fallback(query) do
    case Core.Repo.aggregate(query, :count, :id) do
      count when count > @max_list_cache -> {:ignore, []}
      _ -> {:commit, Core.Repo.all(query)}
    end
  end
end