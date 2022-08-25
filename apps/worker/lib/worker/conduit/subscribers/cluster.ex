defmodule Worker.Conduit.Subscribers.Cluster do
  use Worker.Conduit.Subscribers.Base
  alias Core.Services.Dns
  alias Core.Schema.{DnsRecord}

  def process(%Conduit.Message{body: body} = msg, _) do
    case destroy(body) do
      {:ok, _} -> ack(msg)
      _ -> nack(msg)
    end
  end

  def destroy(%DnsRecord{} = r) do
    %{creator: user} = Core.Repo.preload(r, [:creator])
    Dns.delete_record(r.name, r.type, user)
    |> log()
  end
end
