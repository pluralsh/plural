defmodule Watchman.GraphQl.BuildMutationsTest do
  use Watchman.DataCase, async: true
  use Mimic

  describe "createBuild" do
    test "It can create a new build" do
      expect(Watchman.Deployer, :wake, fn -> :ok end)
      expect(Watchman.Forge.Repositories, :list_installations, fn _, _ ->
        {:ok, %{edges: [%{node: %{repository: %{name: "forge"}}}]}}
      end)

      {:ok, %{data: %{"createBuild" => build}}} = run_query("""
        mutation {
          createBuild(attributes: {repository: "forge"}) {
            id
            type
            status
          }
        }
      """, %{}, %{current_user: insert(:user)})

      assert build["id"]
      assert build["type"] == "DEPLOY"
      assert build["status"] == "QUEUED"
    end
  end
end