defmodule GraphQl.VersionMutationTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "updateVersion" do
    test "it can update tagging for versions" do
      user  = insert(:user)
      repo  = insert(:repository, publisher: build(:publisher, owner: user))
      chart = insert(:chart, repository: repo)
      v     = insert(:version, chart: chart)

      {:ok, %{data: %{"updateVersion" => update}}} = run_query("""
        mutation Update($spec: VersionSpec, $attrs: VersionAttributes!) {
          updateVersion(spec: $spec, attributes: $attrs) {
            id
            tags { tag }
          }
        }
      """, %{
        "spec" => %{"repository" => repo.name, "chart" => chart.name, "version" => v.version},
        "attrs" => %{"tags" => [%{"tag" => "warm"}, %{"tag" => "stable"}]}
      }, %{current_user: user})

      assert update["id"] == v.id
      assert Enum.map(update["tags"], & &1["tag"])
             |> Enum.sort() == ["stable", "warm"]
    end
  end
end
