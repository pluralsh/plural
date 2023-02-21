defmodule Core.PubSub.Posthog.UsersTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.PubSub.Consumers
  alias Core.PubSub

  describe "UserCreated" do
    test "it will log user.created" do
      user = insert(:user)
      expect(Posthog, :capture, fn "user.created", attrs -> {:ok, attrs} end)

      event = %PubSub.UserCreated{item: user}
      {:ok, attrs} = Consumers.Posthog.handle_event(event)

      assert attrs.distinct_id == user.id
    end
  end
end
