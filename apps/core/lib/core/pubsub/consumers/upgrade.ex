defmodule Core.PubSub.Consumers.Upgrade do
  @moduledoc """
  Single destination webhook publisher

  For cases where a list of webhooks need to be derived, use Fanout
  """
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10

  alias Core.PubSub.Upgradeable
  alias Core.Services.Upgrades

  def handle_event(event) do
    with {message, [_ | _] = queues} <- Upgradeable.derive(event) do
      Enum.map(queues, &Upgrades.create_upgrade(message, &1))
    end
  end
end
