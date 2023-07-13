defmodule Core.PubSub.Consumers.Cache.AccountsTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub
  alias Core.PubSub.Consumers.Cache

  describe "PlatformSubscriptionCreated" do
    test "it will wipe login caches" do
      account = insert(:account)
      users = insert_list(3, :user, account: account)
      sub = insert(:platform_subscription, account: account)
      Enum.each(users, &cache/1)

      event = %PubSub.PlatformSubscriptionCreated{item: sub}
      Cache.handle_event(event)

      for u <- users do
        refute Core.Cache.get({:login, u.id})
      end
    end
  end

  describe "GroupMemberCreated" do
    test "it will overwrite the login cache" do
      gm = insert(:group_member)

      event = %PubSub.GroupMemberCreated{item: gm}
      Cache.handle_event(event)

      %{id: user_id} = Core.Cache.get({:login, gm.user_id})
      assert user_id == gm.user_id
    end
  end

  describe "GroupMemberDeleted" do
    test "it will overwrite the login cache" do
      gm = insert(:group_member)

      event = %PubSub.GroupMemberDeleted{item: gm}
      Cache.handle_event(event)

      %{id: user_id} = Core.Cache.get({:login, gm.user_id})
      assert user_id == gm.user_id
    end
  end
end
