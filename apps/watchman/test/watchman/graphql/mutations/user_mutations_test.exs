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
end