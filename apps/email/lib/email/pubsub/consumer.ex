defmodule Email.PubSub.Consumer do
  @moduledoc nil
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10

  def handle_event(event) do
    with %Bamboo.Email{} = email <- Email.Deliverable.email(event) do
      Core.Email.Mailer.deliver_now(email)
      |> IO.inspect()
    end
  end
end
