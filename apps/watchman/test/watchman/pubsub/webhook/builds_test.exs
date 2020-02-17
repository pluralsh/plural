defmodule Watchman.Webhook.BuildTest do
  use Watchman.DataCase, async: true
  use Mimic
  alias Watchman.PubSub.Consumers.Webhook
  alias Watchman.PubSub

  @wh_url Watchman.conf(:incoming_webhook)

  describe "BuildFailed" do
    test "it will send a failed webhook" do
      build = insert(:build, status: :failed)
      expect(Mojito, :post, fn @wh_url, _, payload -> Jason.decode(payload) end)

      event = %PubSub.BuildFailed{item: build}
      {:ok, decoded} = Webhook.handle_event(event)

      assert decoded["text"] =~ build.repository
      assert decoded["structured_message"] =~ build.id
      assert decoded["structured_message"] =~ "red"
    end
  end

  describe "BuildSucceeded" do
    test "it will send a succeeded webhook" do
      build = insert(:build, status: :successful)
      expect(Mojito, :post, fn @wh_url, _, payload -> Jason.decode(payload) end)

      event = %PubSub.BuildSucceeded{item: build}
      {:ok, decoded} = Webhook.handle_event(event)

      assert decoded["text"] =~ build.repository
      assert decoded["structured_message"] =~ build.id
      assert decoded["structured_message"] =~ "green"
    end
  end
end