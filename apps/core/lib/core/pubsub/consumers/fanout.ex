defmodule Core.PubSub.Consumers.Fanout do
  @moduledoc nil
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10

  def handle_event(event) do
    Core.PubSub.Fanout.fanout(event)
  end
end