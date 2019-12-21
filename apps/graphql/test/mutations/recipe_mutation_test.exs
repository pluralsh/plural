defmodule GraphQl.RecipeMutationsTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "createRecipe" do
    test "It can create a recipe and its sub records" do
      %{publisher: %{owner: user}} = repo = insert(:repository)
      chart = insert(:chart, repository: repo, dependencies: %{
        dependencies: [%{type: :terraform, name: "tf", repo: repo.name}]
      })
      tf = insert(:terraform, repository: repo, name: "tf")
      other_repo = insert(:repository)
      other_chart = insert(:chart, repository: other_repo)

      attrs = %{
        name: "recipe",
        sections: [
          %{
            name: repo.name,
            items: [
              %{name: chart.name, type: :HELM, configuration: [%{type: :INT, name: "something"}]},
              %{name: tf.name, type: :TERRAFORM, configuration: [%{type: :INT, name: "something"}]}
            ]
          },
          %{
            name: other_repo.name,
            items: [
              %{name: other_chart.name, type: :HELM}
            ]
          }
        ]
      } |> Jason.encode!() |> Jason.decode!()

      {:ok, %{data: %{"createRecipe" => created}}} = run_query("""
        mutation CreateRecipe($attrs: RecipeAttributes!, $repoName: String!) {
          createRecipe(repositoryName: $repoName, attributes: $attrs) {
            id
            name
            recipeSections {
              repository {
                id
              }
              recipeItems {
                chart {
                  id
                }
                terraform {
                  id
                }
              }
            }
          }
        }
      """, %{"repoName" => repo.name, "attrs" => attrs}, %{current_user: user})

      assert created["name"] == "recipe"

      sections = created["recipeSections"]
      assert Enum.map(sections, & &1["repository"])
             |> ids_equal([repo, other_repo])

      items = Enum.flat_map(sections, & &1["recipeItems"])
      assert Enum.map(items, & &1["chart"])
             |> Enum.filter(& &1)
             |> ids_equal([chart, other_chart])

      assert Enum.map(items, & &1["terraform"])
             |> Enum.filter(& &1)
             |> ids_equal([tf])
    end
  end

  describe "installRecipe" do
    test "You can install recipes" do
      recipe = insert(:recipe)
      %{repository: repo} = section = insert(:recipe_section, recipe: recipe)
      chart = insert(:chart, repository: repo)
      insert(:version, chart: chart, version: chart.latest_version)
      insert(:recipe_item, recipe_section: section, chart: chart)

      {:ok, %{data: %{"installRecipe" => [installation]}}} = run_query("""
        mutation Install($id: ID!, $context: Map!) {
          installRecipe(recipeId: $id, context: $context) {
            repository {
              id
            }
          }
        }
      """, %{"id" => recipe.id, "context" => Jason.encode!(%{repo.id => %{"some" => "value"}})}, %{current_user: insert(:user)})

      assert installation["repository"]["id"] == repo.id
    end
  end
end