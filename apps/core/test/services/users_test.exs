defmodule Core.Services.UsersTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Users
  alias Core.PubSub

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

      %{account: account} = Core.Repo.preload(user, [:account])
      assert account.name == user.email
      assert account.root_user_id == user.id
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

  describe "#delete_persisted_token" do
    test "A user can delete their tokens" do
      user = insert(:user)
      token = insert(:persisted_token, user: user)

      {:ok, del} = Users.delete_persisted_token(token.id, user)

      assert del.id == token.id
      refute refetch(token)
    end

    test "Users cannot delete other's tokens" do
      user  = insert(:user)
      token = insert(:persisted_token)

      {:error, _} = Users.delete_persisted_token(token.id, user)
    end
  end

  describe "#upsert_webhook/2" do
    test "It can create a new webhook for a url" do
      user = insert(:user)
      url  = "https://www.example.com"

      {:ok, webhook} = Users.upsert_webhook(url, user)

      assert webhook.user_id == user.id
      assert webhook.url == url
      assert webhook.secret
    end

    test "It will echo an existing webhook" do
      %{user: user} = webhook = insert(:webhook)

      {:ok, upserted} = Users.upsert_webhook(webhook.url, user)

      assert upserted.secret == webhook.secret
      assert upserted.url == webhook.url
      assert upserted.user_id == user.id
    end
  end

  describe "#create_reset_token/1" do
    test "it can create a pwd reset token" do
      user = insert(:user)

      {:ok, reset} = Users.create_reset_token(%{
        email: user.email,
        type: :password
      })

      assert reset.user.id == user.id
      assert reset.type == :password
      assert reset.external_id

      assert_receive {:event, %PubSub.ResetTokenCreated{item: ^reset}}
    end

    test "it will fail on invalid emails" do

      {:error, :not_found} = Users.create_reset_token(%{
        email: "invalid@email.com",
        type: :password
      })
    end
  end
end
