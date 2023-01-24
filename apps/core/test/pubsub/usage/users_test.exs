defmodule Core.PubSub.Usage.UsersTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub
  alias Core.PubSub.Consumers.Usage

  describe "UserCreated" do
    test "it can post a message about the meeting" do
      user = insert(:user)

      event = %PubSub.UserCreated{item: user}
      {1, _} = Usage.handle_event(event)

      account = refetch(user.account)
      assert account.user_count == 1
      assert account.usage_updated
    end

    test "it ignores service accounts" do
      user = insert(:user, service_account: true)

      event = %PubSub.UserCreated{item: user}
      :ok = Usage.handle_event(event)
    end
  end

  describe "UserDeleted" do
    test "it can post a message about the meeting" do
      user = insert(:user, account: build(:account, user_count: 1))

      event = %PubSub.UserDeleted{item: user}
      {1, _} = Usage.handle_event(event)

      account = refetch(user.account)
      assert account.user_count == 0
      assert account.usage_updated
    end

    test "it ignores service accounts" do
      user = insert(:user, service_account: true)

      event = %PubSub.UserDeleted{item: user}
      :ok = Usage.handle_event(event)
    end
  end
end
