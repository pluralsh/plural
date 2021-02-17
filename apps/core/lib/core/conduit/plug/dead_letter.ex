defmodule Core.Conduit.Plug.DeadLetter do
  use Conduit.Plug.Builder

  @moduledoc """
  Publishes messages that were nacked or raised an exception to a
  dead letter destination.
  The following options are required:
    * `broker` - The broker to publish the message with.
    * `publish_to` - The place to publish the message.
  In order for this to work, you must also define an outgoing publish with the same
  name as the `publish_to` option in your broker.
      publish :error, to: "my_app.error"
  ## Examples
      plug Conduit.Plug.DeadLetter, broker: MyApp.Broker, publish_to: :error
  """

  def init(opts) do
    # Fail if opts are missing
    _ = Keyword.fetch!(opts, :publish_to)
    _ = Keyword.fetch!(opts, :broker)

    opts
  end

  @doc """
  Publishes messages that were nacked or raised an exception to a
  dead letter destination.
  """
  def call(message, next, opts) do
    message = next.(message)

    case message.status do
      :nack -> publish_dead_letter(message, opts)
      :ack -> message
    end
  rescue
    error ->
      message
      |> put_header("exception", Exception.format(:error, error))
      |> publish_dead_letter(opts)
  end

  @spec publish_dead_letter(Conduit.Message.t(), Keyword.t()) :: Conduit.Message.t()
  defp publish_dead_letter(message, opts) do
    broker = Keyword.get(opts, :broker)
    publish_to = Keyword.get(opts, :publish_to)

    broker.publish(message, publish_to, opts)

    ack(message)
  end
end
