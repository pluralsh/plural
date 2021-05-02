defmodule GraphQl.DependenciesQueriesTest do
  use Core.SchemaCase
  import GraphQl.TestHelpers

  describe "closure" do
    test "it will find the dependency closure of a resource" do
      chart  = insert(:chart)
      chart2 = insert(:chart)
      chart3 = insert(:chart)
      t1 = insert(:terraform, dependencies: %{dependencies: [
        %{type: :helm, repo: chart2.repository.name, name: chart2.name}
      ]})

      t2 = insert(:terraform, dependencies: %{dependencies: [
        %{type: :helm, repo: chart.repository.name, name: chart.name},
        %{type: :helm, repo: chart3.repository.name, name: chart3.name},
        %{type: :terraform, repo: t1.repository.name, name: t1.name}
      ]})

      {:ok, %{data: %{"closure" => closure}}} = run_query("""
        query Closure($id: ID!) {
          closure(id: $id, type: TERRAFORM) {
            terraform { id }
            helm { id }
          }
        }
      """, %{"id" => t2.id}, %{current_user: insert(:user)})

      assert Enum.map(closure, & &1["helm"] || &1["terraform"])
             |> ids_equal([t1, chart, chart3, chart2])
    end
  end
end
