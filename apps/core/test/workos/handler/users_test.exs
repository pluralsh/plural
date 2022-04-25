defmodule Core.WorkOS.Handler.UsersTest do
  use Core.SchemaCase, async: true
  alias Core.WorkOS.{Event, Resources, Handler}

  describe "UserCreated" do
    test "it will add a new user" do
      dir = insert(:account_directory, directory_id: "dir_id")
      payload = Jason.encode!(%{
        event: "dsync.user.created",
        data: %{
          id: "user_id",
          directory_id: "dir_id",
          first_name: "some",
          last_name: "user",
          emails: [%{primary: true, value: "some@example.com"}]
        }
      })

      event = Jason.decode!(payload) |> Event.parse()
      Handler.handle(event)

      user = Resources.get_user("user_id")
      assert user.account_id == dir.account_id
      assert user.name == "some user"
      assert user.email == "some@example.com"
    end
  end

  describe "UserUpdated" do
    test "it will add a new user" do
      dir = insert(:account_directory, directory_id: "dir_id")
      user = insert(:user, account: dir.account, external_id: "user_id")
      payload = Jason.encode!(%{
        event: "dsync.user.updated",
        data: %{
          id: "user_id",
          directory_id: "dir_id",
          first_name: "some",
          last_name: "user",
          emails: [%{primary: true, value: "some@example.com"}]
        }
      })

      event = Jason.decode!(payload) |> Event.parse()
      Handler.handle(event)

      found = Resources.get_user("user_id")
      assert found.id == user.id
      assert found.account_id == dir.account_id
      assert found.name == "some user"
      assert found.email == "some@example.com"
    end
  end
end
