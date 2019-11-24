defmodule GraphQl.UserQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "me" do
    test "It will return the current user" do
      user = insert(:user)

      {:ok, %{data: %{"me" => me}}} = run_query("""
        query {
          me {
            id
            name
          }
        }
      """, %{}, %{current_user: user})

      assert me["id"] == user.id
      assert me["name"] == user.name
    end
  end

  describe "publisher" do
    test "It will fetch your publisher" do
      %{owner: user} = publisher = insert(:publisher)

      {:ok, %{data: %{"publisher" => found}}} = run_query("""
        query {
          publisher {
            id
          }
        }
      """, %{}, %{current_user: user})

      assert found["id"] == publisher.id
    end
  end

  describe "users" do
    test "It will list all users" do
      [user | _] = users = insert_list(3, :user)

      {:ok, %{data: %{"users" => found}}} = run_query("""
        query {
          users(first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(users)
    end
  end

  describe "publishers" do
    test "It will list all publishers" do
      publishers = insert_list(3, :publisher)

      {:ok, %{data: %{"publishers" => found}}} = run_query("""
        query {
          publishers(first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(publishers)
    end
  end

  describe "tokens" do
    test "It will list tokens for a user" do
      user = insert(:user)
      tokens = insert_list(3, :persisted_token, user: user)

      {:ok, %{data: %{"tokens" => found}}} = run_query("""
        query {
          tokens(first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(tokens)
    end
  end
end