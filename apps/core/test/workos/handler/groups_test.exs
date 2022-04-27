defmodule Core.WorkOS.Handler.GroupsTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Accounts
  alias Core.PubSub
  alias Core.WorkOS.{Event, Resources, Handler}

  describe "GroupCreated" do
    test "it will add a new user" do
      dir = insert(:account_directory, directory_id: "dir_id")
      payload = Jason.encode!(%{
        event: "dsync.group.created",
        data: %{
          id: "group_id",
          directory_id: "dir_id",
          name: "group"
        }
      })

      event = Jason.decode!(payload) |> Event.parse()
      Handler.handle(event)

      group = Resources.get_group("group_id")
      assert group.account_id == dir.account_id
      assert group.name == "group"
    end
  end

  describe "GroupUpdated" do
    test "it will add a new user" do
      dir = insert(:account_directory, directory_id: "dir_id")
      gp  = insert(:group, account: dir.account, external_id: "group_id")
      payload = Jason.encode!(%{
        event: "dsync.group.updated",
        data: %{
          id: "group_id",
          directory_id: "dir_id",
          name: "group"
        }
      })

      event = Jason.decode!(payload) |> Event.parse()
      Handler.handle(event)

      group = Resources.get_group("group_id")
      assert gp.id == group.id
      assert group.account_id == dir.account_id
      assert group.name == "group"
    end
  end

  describe "GroupDeleted" do
    test "it will add a new user" do
      dir = insert(:account_directory, directory_id: "dir_id")
      gp  = insert(:group, account: dir.account, external_id: "group_id")
      payload = Jason.encode!(%{
        event: "dsync.group.deleted",
        data: %{
          id: "group_id",
          directory_id: "dir_id",
          name: "group"
        }
      })

      event = Jason.decode!(payload) |> Event.parse()
      Handler.handle(event)

      refute refetch(gp)
    end
  end

  describe "GroupUserCreated" do
    setup [:setup_root_user]
    test "it will add a new user", %{account: account} do
      insert(:account_directory, account: account, directory_id: "dir_id")
      gp   = insert(:group, account: account, external_id: "group_id")
      user = insert(:user, account: account, external_id: "user_id")
      payload = Jason.encode!(%{
        event: "dsync.group.user_added",
        data: %{
          user: %{id: "user_id", emails: [%{primary: true, value: "some@example.com"}]},
          group: %{id: "group_id", name: "group"},
          directory_id: "dir_id"
        }
      })

      event = Jason.decode!(payload) |> Event.parse()
      Handler.handle(event)

      assert Accounts.get_group_member(gp.id, user.id)
      assert_receive {:event, %PubSub.GroupMemberCreated{}}
    end
  end

  describe "GroupUserDeleted" do
    setup [:setup_root_user]

    test "it will add a new user", %{account: account} do
      insert(:account_directory, account: account, directory_id: "dir_id")
      gp   = insert(:group, account: account, external_id: "group_id")
      user = insert(:user, account: account, external_id: "user_id")
      gm   = insert(:group_member, user: user, group: gp)
      payload = Jason.encode!(%{
        event: "dsync.group.user_removed",
        data: %{
          user: %{id: "user_id", emails: [%{primary: true, value: "some@example.com"}]},
          group: %{id: "group_id", name: "group"},
          directory_id: "dir_id"
        }
      })

      event = Jason.decode!(payload) |> Event.parse()
      Handler.handle(event)

      refute refetch(gm)
      assert_receive {:event, %PubSub.GroupMemberDeleted{}}
    end
  end
end
