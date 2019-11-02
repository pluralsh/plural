defmodule GraphQl.ChartQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "charts" do
    test "Users with a repo installation can list charts" do
      %{repository: repo, user: user} = insert(:installation)
      charts = insert_list(3, :chart, repository: repo)

      {:ok, %{data: %{"charts" => found}}} = run_query("""
        query Charts($repoId: ID!) {
          charts(repositoryId: $repoId, first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{"repoId" => repo.id}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(charts)
    end
  end

  describe "chart" do
    test "It can query a chart" do
      chart = insert(:chart)
      user  = insert(:user)

      {:ok, %{data: %{"chart" => found}}} = run_query("""
        query Chart($id: ID!) {
          chart(id: $id) {
            id
          }
        }
      """, %{"id" => chart.id}, %{current_user: user})

      assert found["id"] == chart.id
    end
  end

  describe "versions" do
    test "A user with a repo installation can list versions for a chart" do
      %{repository: repo, user: user} = insert(:installation)
      chart = insert(:chart, repository: repo)
      versions = for i <- 1..3, do: insert(:version, chart: chart, version: "#{i}.0.0")

      {:ok, %{data: %{"versions" => found}}} = run_query("""
        query Versions($chartId: ID!) {
          versions(chartId: $chartId, first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{"chartId" => chart.id}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(versions)
    end
  end
end