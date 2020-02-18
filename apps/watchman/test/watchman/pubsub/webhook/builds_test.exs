defmodule Watchman.Webhook.BuildTest do
  use Watchman.DataCase
  use Mimic
  alias Watchman.PubSub.Consumers.Webhook
  alias Watchman.PubSub

  setup :set_mimic_global

  describe "BuildFailed" do
    test "it will send a failed webhook" do
      build = insert(:build, status: :failed)
      %{url: url} = wh = insert(:webhook)

      myself = self()
      expect(Mojito, :post, fn ^url, _, payload, _ ->
        decoded = Jason.decode!(payload)
        send myself, {:payload, decoded}
        {:ok, decoded}
      end)

      event = %PubSub.BuildFailed{item: build}
      Webhook.handle_event(event)

      assert_receive {:payload, payload}

      assert payload["text"] =~ build.repository
      assert payload["structured_message"] =~ build.id
      assert payload["structured_message"] =~ "red"

      assert refetch(wh).health == :healthy
    end
  end

  describe "BuildSucceeded" do
    test "it will send a succeeded webhook" do
      build = insert(:build, status: :successful)
      %{url: url} = wh = insert(:webhook)

      myself = self()
      expect(Mojito, :post, fn ^url, _, payload, _ ->
        decoded = Jason.decode!(payload)
        send myself, {:payload, decoded}
        {:ok, decoded}
      end)

      event = %PubSub.BuildSucceeded{item: build}
      Webhook.handle_event(event)

      assert_receive {:payload, payload}

      assert payload["text"] =~ build.repository
      assert payload["structured_message"] =~ build.id
      assert payload["structured_message"] =~ "green"

      assert refetch(wh).health == :healthy
    end
  end
end