defmodule Watchman.Services.UsersTest do
  use Watchman.DataCase, async: true
  alias Watchman.Services.{Users}

  describe "#login_user/2" do
    test "It will log in a user by email/pwd" do
      {:ok, _user} = Users.create_user(%{
        name: "Some user",
        email: "user@example.com",
        password: "bogus password"
      })

      {:ok, _} = Users.login_user("user@example.com", "bogus password")
      {:error, _} = Users.login_user("user@example.com", "incorrect")
    end

    test "Disabled users are not allowed to log in" do
      {:ok, _user} = Users.create_user(%{
        name: "Some user",
        email: "user@example.com",
        password: "bogus password",
        deleted_at: Timex.now()
      })

      {:error, _} = Users.login_user("user@example.com", "bogus password")
    end
  end

  describe "create_invite/1" do
    test "it can create an invite link" do
      {:ok, invite} = Users.create_invite(%{email: "someone@example.com"})

      assert invite.secure_id
    end
  end

  describe "#create_user/2" do
    test "A user can be created by invite token" do
      invite = insert(:invite)

      {:ok, user} = Users.create_user(%{
        password: "strong password",
        name: "some user"
      }, invite.secure_id)

      assert user.email == invite.email
    end
  end

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

  describe "#disable_user/2" do
    test "It can disable a user if specified" do
      {:ok, user} = Users.create_user(%{
        name: "Some user",
        email: "user@example.com",
        password: "bogus password"
      })

      {:ok, disabled} = Users.disable_user(user.id, true, user)

      assert disabled.deleted_at
    end

    test "It can wipe disabled state" do
      {:ok, user} = Users.create_user(%{
        name: "Some user",
        email: "user@example.com",
        password: "bogus password",
        deleted_at: Timex.now()
      })

      {:ok, enabled} = Users.disable_user(user.id, false, user)

      refute enabled.deleted_at
    end
  end
end