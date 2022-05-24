defmodule Core.PubSub.Consumers.Cache.UsersTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub
  alias Core.PubSub.Consumers.Cache

  describe "UserUpdated" do
    test "it will overwrite the login cache" do
      user = insert(:user)

      event = %PubSub.UserUpdated{item: user}
      Cache.handle_event(event)

      found = Core.Cache.get({:login, user.id})
      assert found.id == user.id
    end
  end

  describe "CacheUser" do
    test "it will overwrite the login cache" do
      user = insert(:user)

      event = %PubSub.CacheUser{item: user}
      Cache.handle_event(event)

      found = Core.Cache.get({:login, user.id})
      assert found.id == user.id
    end
  end

  describe "EmailConfirmed" do
    test "it will overwrite the login cache" do
      user = insert(:user)

      event = %PubSub.EmailConfirmed{item: user}
      Cache.handle_event(event)

      found = Core.Cache.get({:login, user.id})
      assert found.id == user.id
    end
  end
end
