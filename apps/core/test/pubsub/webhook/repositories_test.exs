defmodule Core.PubSub.Webhook.RepositoriesTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.PubSub.Consumers.Webhook
  alias Core.PubSub

  describe "InstallationUpdated" do
    test "It will send a webhook for a user" do
      user = insert(:user)
      %{url: url} = insert(:webhook, user: user)
      inst = insert(:installation, user: user)
      expect(Mojito, :post, fn ^url, _, body, _ -> Jason.decode!(body) end)

      event = %PubSub.InstallationUpdated{item: inst}
      [body] = Webhook.handle_event(event)

      assert body["repository"] == inst.repository.name
      assert body["message"] == "updated repository configuration"
    end

    test "It will ignore if no webhooks for the user" do
      user = insert(:user)
      inst = insert(:installation, user: user)

      event = %PubSub.InstallationUpdated{item: inst}
      {_, []} = Webhook.handle_event(event)
    end
  end
end