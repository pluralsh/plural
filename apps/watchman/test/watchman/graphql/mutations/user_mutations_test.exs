defmodule Watchman.GraphQl.UserMutationsTest do
  use Watchman.DataCase, async: true
  alias Watchman.Services.Users

  describe "signIn" do
    test "A user can be signed in" do
      {:ok, user} = Users.create_user(%{
        name: "some user",
        email: "email@example.com",
        password: "bogus password"
      })

      {:ok, %{data: %{"signIn" => signin}}} = run_query("""
        mutation SignIn($email: String!, $password: String!) {
          signIn(email: $email, password: $password) {
            id
          }
        }
      """, %{"email" => user.email, "password" => "bogus password"})

      assert signin["id"] == user.id
    end
  end

  describe "updateUser" do
    test "It can update a user's attributes" do
      {:ok, user} = Users.create_user(%{
        name: "some user",
        email: "email@example.com",
        password: "bogus password"
      })

      {:ok, %{data: %{"updateUser" => updated}}} = run_query("""
        mutation UpdateUser($attributes: UserAttributes!) {
          updateUser(attributes: $attributes) {
            name
          }
        }
      """, %{"attributes" => %{"name" => "new name"}}, %{current_user: user})

      assert updated["name"] == "new name"
    end
  end

  describe "createInvite" do
    test "It can create an invite" do
      {:ok, %{data: %{"createInvite" => invite}}} = run_query("""
        mutation CreateInvite($email: String!) {
          createInvite(attributes: {email: $email}) {
            secureId
            email
          }
        }
      """, %{"email" => "someone@example.com"})

      assert invite["secureId"]
      assert invite["email"] == "someone@example.com"
    end
  end

  describe "signup" do
    test "It can create a user from an invite" do
      invite = insert(:invite)

      {:ok, %{data: %{"signup" => user}}} = run_query("""
        mutation Signup($invite: String!, $attributes: UserAttributes!) {
          signup(inviteId: $invite, attributes: $attributes) {
            jwt
            email
          }
        }
      """, %{"invite" => invite.secure_id, "attributes" => %{
        "password" => "strong password",
        "name" => "Some User"
      }})

      assert user["jwt"]
      assert user["email"] == invite.email
    end
  end
end