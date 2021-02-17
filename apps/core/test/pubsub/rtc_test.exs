defmodule Core.PubSub.Consumers.RtcTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.PubSub

  describe "#handle_event/1" do
    test "it will send a message to the rtc queue" do
      incident = insert(:incident)
      event = %PubSub.IncidentCreated{item: incident}
      expect(Core.Conduit.Broker, :publish, fn %Conduit.Message{body: ^event}, :rtc -> :ok end)

      :ok = PubSub.Consumers.Rtc.handle_event(event)
    end
  end
end
