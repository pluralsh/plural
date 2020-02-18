defmodule Core.PubSub.Webhook.PaymentsTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.PubSub.Consumers.Webhook
  alias Core.PubSub

  describe "SubscriptionUpdated" do
    test "It will post to the users webhook" do
      user = insert(:user)
      %{url: url} = insert(:webhook, user: user)
      inst = insert(:installation, user: user)
      subscription = insert(:subscription, installation: inst)
      expect(Mojito, :post, fn ^url, _, body, _ -> Jason.decode!(body) end)

      event = %PubSub.SubscriptionUpdated{item: subscription}
      [body] = Webhook.handle_event(event)

      assert body["repository"] == inst.repository.name
      assert body["message"] == "updated repository subscription"
    end
  end

  describe "SubscriptionCreated" do
    test "It will post to the users webhook" do
      user = insert(:user)
      %{url: url} = insert(:webhook, user: user)
      inst = insert(:installation, user: user)
      subscription = insert(:subscription, installation: inst)
      expect(Mojito, :post, fn ^url, _, body, _ -> Jason.decode!(body) end)

      event = %PubSub.SubscriptionCreated{item: subscription}
      [body] = Webhook.handle_event(event)

      assert body["repository"] == inst.repository.name
      assert body["message"] == "created repository subscription"
    end
  end
end