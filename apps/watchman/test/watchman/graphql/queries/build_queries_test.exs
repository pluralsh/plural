defmodule Watchman.GraphQl.BuildQueriesTest do
  use Watchman.DataCase, async: true

  describe "builds" do
    test "It can list builds" do
      builds = insert_list(3, :build)

      {:ok, %{data: %{"builds" => found}}} = run_query("""
        query {
          builds(first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{})

      assert from_connection(found)
             |> ids_equal(builds)
    end
  end
end