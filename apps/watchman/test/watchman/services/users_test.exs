defmodule Watchman.Services.UsersTest do
  use Watchman.DataCase, async: true
  alias Watchman.Services.{Users}

  describe "update_user/2" do
    test "It can update a user" do
      user = insert(:user)

      {:ok, updated} = Users.update_user(%{password: "bogus password"}, user)

      assert updated.password_hash
    end
  end

  describe "create_user/2" do
    test "It can create a new user" do
      {:ok, user} = Users.create_user(%{
        name: "Some user",
        email: "user@example.com",
        password: "bogus password"
      })

      assert user.name == "Some user"
      assert user.email == "user@example.com"
    end
  end
end