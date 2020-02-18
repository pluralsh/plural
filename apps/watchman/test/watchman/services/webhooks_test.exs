defmodule Watchman.Services.WebhooksTest do
  use Watchman.DataCase, async: true
  use Mimic
  alias Watchman.Services.Webhooks

  describe "#create" do
    test "It will create a new webhook" do
      {:ok, wh} = Webhooks.create(%{url: "https://example.com"})

      assert wh.health == :healthy
      assert wh.type == :piazza
      assert wh.url == "https://example.com"
    end
  end

  describe "#deliver" do
    test "It will post to the configured url, and mark healthy when successful" do
      %{url: url} = wh = insert(:webhook)
      expect(Mojito, :post, fn ^url, _, _, _ -> {:ok, %{}} end)
      build = insert(:build, status: :successful)

      {:ok, result} = Webhooks.deliver(build, wh)

      assert result.health == :healthy
    end

    test "It will post to the url, and mark unhealthy if unsuccessful" do
      %{url: url} = wh = insert(:webhook)
      expect(Mojito, :post, fn ^url, _, _, _ -> {:error, %{}} end)
      build = insert(:build, status: :successful)

      {:ok, result} = Webhooks.deliver(build, wh)

      assert result.health == :unhealthy
    end
  end
end