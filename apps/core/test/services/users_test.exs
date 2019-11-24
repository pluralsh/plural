defmodule Core.Services.UsersTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Users

  describe "#create_user" do
    test "Users can be created" do
      {:ok, user} = Users.create_user(%{
        name: "some user",
        password: "superstrongpassword",
        email: "something@example.com"
      })

      assert user.name == "some user"
      assert user.email == "something@example.com"
      assert user.password_hash
    end
  end

  describe "#create_publisher" do
    test "Users can create publishers" do
      user = insert(:user)
      {:ok, publisher} = Users.create_publisher(%{name: "somepublisher"}, user)

      assert publisher.name == "somepublisher"
      assert publisher.owner_id == user.id
    end
  end

  describe "#update_user" do
    test "Users can update themselves" do
      {:ok, user} = Users.create_user(%{
        name: "some user",
        password: "superstrongpassword",
        email: "something@example.com"
      })

      {:ok, updated} = Users.update_user(%{name: "real user"}, user)

      assert updated.name == "real user"
    end
  end

  describe "#update_publisher" do
    test "Users can update their own publisher" do
      user = insert(:user)
      publisher = insert(:publisher, owner: user)

      {:ok, updated} = Users.update_publisher(%{name: "publisher"}, user)

      assert updated.id == publisher.id
      assert updated.name == "publisher"
    end
  end

  describe "#login_user" do
    test "You can log in by password" do
      {:ok, user} = Users.create_user(%{
        name: "some user",
        email: "someone@example.com",
        password: "verystrongpassword"
      })

      {:ok, login} = Users.login_user(user.email, "verystrongpassword")

      assert login.id == user.id

      {:error, :invalid_password} = Users.login_user(user.email, "incorrectpassword")
    end
  end

  describe "#create_persisted_token/1" do
    test "A user can create a persisted token for themselves" do
      user = insert(:user)

      {:ok, %{token: "cmt-" <> _} = token} = Users.create_persisted_token(user)

      assert token.token
      assert Users.get_persisted_token(token.token)
    end
  end
end