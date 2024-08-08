defmodule GraphQl.CloudQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "consoleInstances" do
    test "it can fetch the cloud instances in your account" do
      user = insert(:user)
      instances = insert_list(3, :console_instance, owner: insert(:user, account: user.account))
      insert_list(2, :console_instance)

      {:ok, %{data: %{"consoleInstances" => found}}} = run_query("""
        query {
          consoleInstances(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(instances)
    end
  end

  describe "consoleInstance" do
    test "you can describe console instances you can see" do
      user = insert(:user)
      instance = insert(:console_instance, owner: insert(:user, account: user.account))

      {:ok, %{data: %{"consoleInstance" => found}}} = run_query("""
        query Get($id: ID!) {
          consoleInstance(id: $id) { id }
        }
      """, %{"id" => instance.id}, %{current_user: user})

      assert found["id"] == instance.id
    end

    test "you cannot describe console instances you cannot see" do
      user = insert(:user)
      instance = insert(:console_instance)

      {:ok, %{errors: [_ | _]}} = run_query("""
        query Get($id: ID!) {
          consoleInstance(id: $id) { id }
        }
      """, %{"id" => instance.id}, %{current_user: user})
    end
  end
end
