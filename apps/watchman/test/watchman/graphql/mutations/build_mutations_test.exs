defmodule Watchman.GraphQl.BuildMutationsTest do
  use Watchman.DataCase, async: true

  use Mimic

  describe "createBuild" do
    test "It can create a new build" do
      expect(Watchman.Deployer, :wake, fn -> :ok end)

      {:ok, %{data: %{"createBuild" => build}}} = run_query("""
        mutation {
          createBuild(attributes: {repository: "my repo"}) {
            id
            type
            status
          }
        }
      """, %{})

      assert build["id"]
      assert build["type"] == "DEPLOY"
      assert build["status"] == "QUEUED"
    end
  end
end