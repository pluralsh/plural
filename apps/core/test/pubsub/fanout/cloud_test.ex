defmodule Core.PubSub.Fanout.ChartsTest do
  use Core.SchemaCase, async: false
  alias Core.PubSub
  use Mimic

  describe "ConsoleInstanceCreated" do
    test "it will enqueue" do
      expect(Core.Conduit.Broker, :publish, fn msg, :cloud -> {:ok, msg} end)

      event = %PubSub.ConsoleInstanceCreated{item: insert(:console_instance)}
      {:ok, ^event} = PubSub.Fanout.handle_event(event)
    end
  end

  describe "ConsoleInstanceUpdated" do
    test "it will enqueue" do
      expect(Core.Conduit.Broker, :publish, fn msg, :cloud -> {:ok, msg} end)

      event = %PubSub.ConsoleInstanceUpdated{item: insert(:console_instance)}
      {:ok, ^event} = PubSub.Fanout.handle_event(event)
    end
  end

  describe "ConsoleInstanceDeleted" do
    test "it will enqueue" do
      expect(Core.Conduit.Broker, :publish, fn msg, :cloud -> {:ok, msg} end)

      event = %PubSub.ConsoleInstanceDeleted{item: insert(:console_instance)}
      {:ok, ^event} = PubSub.Fanout.handle_event(event)
    end
  end
end
