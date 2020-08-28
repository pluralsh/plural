defmodule Watchman.PubSub.Consumers.Recurse do
  use Piazza.PubSub.Consumer,
    broadcaster: Watchman.PubSub.Broadcaster,
    max_demand: 10
  alias Watchman.PubSub.Recurse


  def handle_event(event), do: Recurse.process(event)
end