defmodule Worker.Conduit.Broker do
  use Core.Conduit.Base, otp_app: :worker

  pipeline :in_tracking do
    plug Conduit.Plug.CorrelationId
    plug Conduit.Plug.LogIncoming
  end

  pipeline :error_handling do
    plug Core.Conduit.Plug.DeadLetter, broker: __MODULE__, publish_to: :error
    # plug Core.Conduit.Plug.Retry, attempts: 3 # broken for some reason
  end

  pipeline :deserialize do
    plug Conduit.Plug.Parse, content_type: "application/x-erlang-binary"
  end

  incoming Worker.Conduit.Subscribers do
    pipe_through [:in_tracking, :error_handling, :deserialize]
    subscribe :scan, Scan, from: "plural.scan"
    subscribe :cluster, Cluster, from: "plural.cluster"
  end
end
