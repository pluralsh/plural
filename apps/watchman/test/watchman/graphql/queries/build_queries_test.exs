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
      """, %{}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(builds)
    end
  end

  describe "build" do
    test "It can sideload commands for a build" do
      build = insert(:build)
      commands = for i <- 1..3,
        do: insert(:command, build: build, inserted_at: Timex.now() |> Timex.shift(days: -i))
      expected = commands |> Enum.map(& &1.id) |> Enum.reverse()

      {:ok, %{data: %{"build" => found}}} = run_query("""
        query Build($id: ID!) {
          build(id: $id) {
            id
            commands(first: 10) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      """, %{"id" => build.id}, %{current_user: insert(:user)})

      assert found["id"] == build.id
      assert from_connection(found["commands"]) |> Enum.map(& &1["id"]) == expected
    end
  end
end