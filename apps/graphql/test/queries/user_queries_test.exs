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
end