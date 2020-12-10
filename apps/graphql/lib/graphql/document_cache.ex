defmodule GraphQl.DocumentCache do
  @behaviour Apq.CacheProvider
  alias Core.ReplicatedCache, as: Cache

  def get(hash), do: {:ok, Cache.get({:apq, hash})}

  def put(hash, query) do
    case Cache.put({:apq, hash}, query) do
      :ok -> {:ok, true}
      _ -> {:ok, false}
    end
  end
end