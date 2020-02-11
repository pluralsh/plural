defmodule GraphQl.DocumentCache do
  @behaviour Apq.CacheProvider

  def get(hash) do
    val = Core.Cache.get({:apq, hash})
    {:ok, val}
  end

  def put(hash, query) do
    case Core.Cache.set({:apq, hash}, query) do
      nil -> {:ok, false}
      _ -> {:ok, true}
    end
  end
end