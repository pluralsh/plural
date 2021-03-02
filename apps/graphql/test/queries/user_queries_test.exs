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
    test "it can list users for an account" do
      account = insert(:account)
      users = insert_list(3, :user, account: account)
      insert(:user)

      {:ok, %{data: %{"users" => found}}} = run_query("""
        query {
          users(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: hd(users)})

      assert from_connection(found)
             |> ids_equal(users)
    end

    test "it can search users for an account" do
      account = insert(:account)
      user = insert(:user, account: account, name: "search name")
      insert_list(2, :user, account: account)
      insert(:user)

      {:ok, %{data: %{"users" => found}}} = run_query("""
        query Users($q: String) {
          users(first: 5, q: $q) {
            edges { node { id } }
          }
        }
      """, %{"q" => "search"}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal([user])
    end
  end

  describe "publishers" do
    test "It will list all publishers" do
      publishers = insert_list(3, :publisher)

      {:ok, %{data: %{"publishers" => found}}} = run_query("""
        query {
          publishers(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(publishers)
    end

    test "It can sideload repositories for publishers" do
      [first, second, _] = publishers = insert_list(3, :publisher)
      repos = insert_list(10, :repository, publisher: first)
      other_repos = insert_list(2, :repository, publisher: second)

      {:ok, %{data: %{"publishers" => found}}} = run_query("""
        query {
          publishers(first: 5) {
            edges {
              node {
                id
                repositories { id }
              }
            }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      found_publishers = from_connection(found)
      assert ids_equal(publishers, found_publishers)

      %{"repositories" => sideload} = Enum.find(found_publishers, & &1["id"] == first.id)
      assert length(sideload) == 5
      assert Enum.all?(sideload, fn %{"id" => id} -> Enum.find(repos, & &1.id == id) end)

      %{"repositories" => sideload} = Enum.find(found_publishers, & &1["id"] == second.id)
      assert length(sideload) == 2
      assert Enum.all?(sideload, fn %{"id" => id} -> Enum.find(other_repos, & &1.id == id) end)
    end

    test "it can filter by ids" do
      account = insert(:account)
      publishers = insert_list(3, :publisher, account: account)
      insert(:publisher)

      {:ok, %{data: %{"publishers" => found}}} = run_query("""
        query Publishers($id: ID!) {
          publishers(first: 5, accountId: $id) {
            edges { node { id } }
          }
        }
      """, %{"id" => account.id}, %{current_user: insert(:user)})

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
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(tokens)
    end
  end

  describe "webhooks" do
    test "A user can list their webhooks" do
      user = insert(:user)
      webhooks = insert_list(3, :webhook, user: user)

      {:ok, %{data: %{"webhooks" => found}}} = run_query("""
        query {
          webhooks(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(webhooks)
    end
  end
end
