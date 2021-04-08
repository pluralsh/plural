defmodule Email.PubSub.Consumer do
  @moduledoc nil
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10
  require Logger

  def handle_event(event) do
    with %Bamboo.Email{} = email <- Email.Deliverable.email(event) do
      Core.Email.Mailer.deliver_now(email)
      |> log_error()
    end
  end

  defp log_error({:error, _} = err) do
    Logger.error "Failed to deliver email: #{inspect(err)}"
    err
  end
  defp log_error(pass), do: pass
end
