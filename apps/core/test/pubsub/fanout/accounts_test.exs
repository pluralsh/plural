defmodule Core.PubSub.Fanout.AccountsTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Accounts
  alias Core.PubSub

  describe "ZoomMeetingCreated" do
    test "it can post a message about the meeting" do
      incident = insert(:incident)

      event = %PubSub.ZoomMeetingCreated{
        item: %{join_url: "join-url", incident_id: incident.id, password: "pwd"},
        actor: incident.creator
      }

      {:ok, msg} = PubSub.Fanout.fanout(event)

      assert msg.text == "I just created a zoom meeting, you can join here: join-url"
    end
  end

  describe "GroupUpdated" do
    test "it will add all users on the account to the group when globalized" do
      acct = insert(:account)
      users = insert_list(3, :user, account: acct)
      group = insert(:group, account: acct, global: true)

      event = %PubSub.GroupUpdated{item: %{group | globalized: true}}
      :ok = PubSub.Fanout.fanout(event)

      for user <- users,
        do: assert Accounts.get_group_member(group.id, user.id)
    end

    test "it will ignore if not globalized" do
      acct = insert(:account)
      insert_list(3, :user, account: acct)
      group = insert(:group, account: acct, global: true)

      event = %PubSub.GroupUpdated{item: group}
      :ignore = PubSub.Fanout.fanout(event)
    end
  end

  describe "RoleCreated" do
    test "it will cache all associated users" do
      role = insert(:role)
      group = insert(:group)
      %{user: user1} = insert(:role_binding, role: role, user: build(:user))
      insert(:role_binding, group: group, role: role)
      %{user: user2} = insert(:group_member, group: group)

      event = %PubSub.RoleCreated{item: role}
      2 = PubSub.Fanout.fanout(event)

      assert_receive {:event, %PubSub.CacheUser{item: found1}}
      assert_receive {:event, %PubSub.CacheUser{item: found2}}

      assert ids_equal([user1, user2], [found1, found2])
    end
  end

  describe "RoleUpdated" do
    test "it will cache all associated users" do
      role = insert(:role)
      group = insert(:group)
      %{user: user1} = insert(:role_binding, role: role, user: build(:user))
      insert(:role_binding, group: group, role: role)
      %{user: user2} = insert(:group_member, group: group)

      event = %PubSub.RoleUpdated{item: role}
      2 = PubSub.Fanout.fanout(event)

      assert_receive {:event, %PubSub.CacheUser{item: found1}}
      assert_receive {:event, %PubSub.CacheUser{item: found2}}

      assert ids_equal([user1, user2], [found1, found2])
    end
  end
end
