defmodule Worker.Conduit.Subscribers.Cloud do
  use Worker.Conduit.Subscribers.Base
  alias Core.Services.Cloud.Workflow
  alias Core.PubSub

  def process(%Conduit.Message{body: body} = msg, _) do
    case handle(body) do
      {:ok, _} -> ack(msg)
      _ -> nack(msg)
    end
  end

  def handle(%PubSub.ConsoleInstanceCreated{item: instance}), do: Workflow.provision(instance)
  def handle(%PubSub.ConsoleInstanceUpdated{item: instance}), do: Workflow.sync(instance)
  def handle(%PubSub.ConsoleInstanceDeleted{item: instance}), do: Workflow.deprovision(instance)
end
