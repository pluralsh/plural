defmodule GraphQl.VersionMutationTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers
  alias Core.Services.Versions

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

  describe "release" do
    setup [:setup_root_user]
    test "it will release all installed versions for a repo to the given tags", %{account: account, user: user} do
      repo = insert(:repository, publisher: build(:publisher, account: account))
      inst = insert(:installation, user: user, repository: repo)
      chart = insert(:chart, repository: repo)
      tf = insert(:terraform, repository: repo)
      ci = insert(:chart_installation, chart: chart, installation: inst, version: build(:version, chart: chart))
      ti = insert(:terraform_installation, terraform: tf, installation: inst, version: build(:version, terraform: tf, chart_id: nil, chart: nil))

      {:ok, %{data: %{"release" => true}}} = run_query("""
        mutation Release($repositoryId: ID!, $tags: [String!]) {
          release(repositoryId: $repositoryId, tags: $tags)
        }
      """, %{
        "repositoryId" => repo.id,
        "tags" => ["stable"]
      }, %{current_user: user})

      assert Versions.get_tag(:helm, ci.chart_id, "stable").version_id == ci.version_id
      assert Versions.get_tag(:terraform, ti.terraform_id, "stable").version_id == ti.version_id
    end
  end
end
