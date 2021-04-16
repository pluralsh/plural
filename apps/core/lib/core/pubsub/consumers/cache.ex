defmodule Core.PubSub.Consumers.Cache do
  @moduledoc nil
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10

  def handle_event(event) do
    with {action, key, item} <- Core.PubSub.Cacheable.cache(event) do
      handle_cache(action, key, item)
    end
  end

  defp handle_cache(:set, key, item), do: Core.Cache.put(key, item)
  defp handle_cache(:del, key, _), do: Core.Cache.delete(key)
end
