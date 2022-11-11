defmodule Worker.Conduit.Subscribers.Scan do
  use Conduit.Subscriber
  import Conduit.Message

  def process(%Conduit.Message{body: body} = msg, _) do
    case scan(body) do
      {:ok, _} -> ack(msg)
      _ -> nack(msg)
    end
  end

  def scan(version), do: Core.Services.Scan.terrascan(version)
end
