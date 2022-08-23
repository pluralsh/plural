defmodule Worker.Conduit.Subscribers.Base do
  require Logger

  defmacro __using__(_) do
    quote do
      use Conduit.Subscriber
      import Conduit.Message
      import Worker.Conduit.Subscribers.Base
    end
  end

  def log({:error, _} = error) do
    Logger.error "Failed to execute worker: #{inspect(error)}"
    error
  end
  def log(res), do: res
end
