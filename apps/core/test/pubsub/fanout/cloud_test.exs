defmodule Core.PubSub.Fanout.CloudTest do
  use Core.SchemaCase, async: false
  alias Core.PubSub
  use Mimic

  describe "ConsoleInstanceCreated" do
    test "it will enqueue" do
      expect(Core.Conduit.Broker, :publish, fn msg, :cloud -> {:ok, msg} end)

      event = %PubSub.ConsoleInstanceCreated{item: insert(:console_instance)}
      {:ok, %Conduit.Message{body: ^event}} = PubSub.Fanout.fanout(event)
    end
  end

  describe "ConsoleInstanceUpdated" do
    test "it will enqueue" do
      expect(Core.Conduit.Broker, :publish, fn msg, :cloud -> {:ok, msg} end)

      event = %PubSub.ConsoleInstanceUpdated{item: insert(:console_instance)}
      {:ok, %Conduit.Message{body: ^event}} = PubSub.Fanout.fanout(event)
    end
  end

  describe "ConsoleInstanceDeleted" do
    test "it will enqueue" do
      expect(Core.Conduit.Broker, :publish, fn msg, :cloud -> {:ok, msg} end)

      event = %PubSub.ConsoleInstanceDeleted{item: insert(:console_instance)}
      {:ok, %Conduit.Message{body: ^event}} = PubSub.Fanout.fanout(event)
    end
  end
end
