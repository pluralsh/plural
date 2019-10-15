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
          }
        }
      """, %{"email" => "mguarino46@gmail.com", "password" => "super strong password"})

      assert found["id"] == user.id
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
end