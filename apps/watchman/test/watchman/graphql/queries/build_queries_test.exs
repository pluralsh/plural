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

  describe "build" do
    test "It can sideload commands for a build" do
      build = insert(:build)
      commands = insert_list(3, :command, build: build)

      {:ok, %{data: %{"build" => found}}} = run_query("""
        query Build($id: ID!) {
          build(id: $id) {
            id
            commands {
              id
            }
          }
        }
      """, %{"id" => build.id})

      assert found["id"] == build.id
      assert ids_equal(found["commands"], commands)
    end
  end
end