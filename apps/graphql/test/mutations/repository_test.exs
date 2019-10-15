defmodule GraphQl.RepositoryMutationsTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "createRepository" do
    test "A user can create a repo for his publisher" do
      %{owner: user, id: id} = insert(:publisher)

      {:ok, %{data: %{"createRepository" => repo}}} = run_query("""
        mutation CreateRepository($attrs: RepositoryAttributes!) {
          createRepository(attributes: $attrs) {
            id
            name
            publisher {
              id
            }
          }
        }
      """, %{"attrs" => %{"name" => "my repo"}}, %{current_user: user})

      assert repo["id"]
      assert repo["name"] == "my repo"
      assert repo["publisher"]["id"] == id
    end
  end
end