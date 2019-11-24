defmodule GraphQl.UserMutationTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers
  alias Core.Services.Users

  describe "login" do
    test "A user can log in with a password" do
      {:ok, user} = Users.create_user(%{
        name: "Michael Guarino",
        email: "mguarino46@gmail.com",
        password: "super strong password"
      })

      {:ok, %{data: %{"login" => found}}} = run_query("""
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            id
            jwt
          }
        }
      """, %{"email" => "mguarino46@gmail.com", "password" => "super strong password"})

      assert found["id"] == user.id
      assert found["jwt"]
    end

    test "Incorrect passwords fail" do
      {:ok, _} = Users.create_user(%{
        name: "Michael Guarino",
        email: "mguarino46@gmail.com",
        password: "super strong password"
      })

      {:ok, %{errors: [_ | _]}} = run_query("""
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            id
          }
        }
      """, %{"email" => "mguarino46@gmail.com", "password" => "incorrect password"})
    end
  end

  describe "signup" do
    test "it can create a new user" do
      {:ok, %{data: %{"signup" => signup}}} = run_query("""
        mutation Signup($attributes: UserAttributes!) {
          signup(attributes: $attributes) {
            id
            name
            email
            jwt
          }
        }
      """, %{"attributes" => %{
        "email" => "mguarino46@gmail.com",
        "password" => "super strong password",
        "name" => "Michael Guarino"
      }})

      assert signup["id"]
      assert signup["name"] == "Michael Guarino"
      assert signup["email"] == "mguarino46@gmail.com"
      assert signup["jwt"]
    end
  end

  describe "updateUser" do
    test "Users can update themselves" do
      {:ok, user} = Users.create_user(%{
        name: "Michael Guarino",
        email: "mguarino46@gmail.com",
        password: "super strong password"
      })

      {:ok, %{data: %{"updateUser" => updated}}} = run_query("""
        mutation UpdateUser($name: String) {
          updateUser(attributes: {name: $name}) {
            id
            name
          }
        }
      """, %{"name" => "Updated User"}, %{current_user: user})

      assert updated["id"] == user.id
      assert updated["name"] == "Updated User"
    end
  end

  describe "createPublisher" do
    test "A user can create a publisher" do
      user = insert(:user)

      {:ok, %{data: %{"createPublisher" => publisher}}} = run_query("""
        mutation CreatePublisher($attrs: PublisherAttributes!) {
          createPublisher(attributes: $attrs) {
            id
            name
            owner {
              id
            }
          }
        }
      """, %{"attrs" => %{"name" => "my publisher"}}, %{current_user: user})

      assert publisher["id"]
      assert publisher["name"] == "my publisher"
      assert publisher["owner"]["id"] == user.id
    end
  end

  describe "updatePublisher" do
    test "A user can update their publisher" do
      %{owner: user} = pub = insert(:publisher)

      {:ok, %{data: %{"updatePublisher" => update}}} = run_query("""
        mutation UpdatePublisher($name: String) {
          updatePublisher(attributes: {name: $name}) {
            id
            name
          }
        }
      """, %{"name" => "updated publisher"}, %{current_user: user})

      assert update["id"] == pub.id
      assert update["name"] == "updated publisher"
    end
  end

  describe "createToken" do
    test "A user can create a token for themself" do
      user = insert(:user)

      {:ok, %{data: %{"createToken" => token}}} = run_query("""
        mutation {
          createToken {
            id
            token
          }
        }
      """, %{}, %{current_user: user})

      assert token["id"]
      assert token["token"]
    end
  end
end