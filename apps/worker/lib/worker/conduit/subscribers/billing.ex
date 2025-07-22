defmodule Worker.Conduit.Subscribers.Billing do
  use Worker.Conduit.Subscribers.Base
  alias Core.Services.Payments
  require Logger

  def process(%Conduit.Message{body: body} = msg, _) do
    case handle(body) do
      {:ok, _} -> ack(msg)
      :ok -> ack(msg)
      err ->
        Logger.error "error handling billing event: #{inspect(err)}"
        nack(msg)
    end
  end

  def handle({:ingest, %Core.Schema.User{} = user, bytes}) when is_integer(bytes) do
    result = Payments.meter_ingest(user, bytes)
    Logger.info("meter_ingest: #{inspect(result)}")
    result
  end
  def handle(_, _), do: :ok
end
