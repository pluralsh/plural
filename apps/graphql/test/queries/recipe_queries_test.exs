defmodule GraphQl.RecipeQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "recipes" do
    test "It will list recipes for a repo" do
      repo    = insert(:repository)
      recipes = insert_list(3, :recipe, repository: repo)
      insert(:recipe)

      {:ok, %{data: %{"recipes" => found}}} = run_query("""
        query Recipes($id: ID!) {
          recipes(repositoryId: $id, first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{"id" => repo.id}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(recipes)
    end
  end

  describe "recipe" do
    test "It will fetch a recipe" do
      recipe = insert(:recipe)
      section = insert(:recipe_section, recipe: recipe)
      item = insert(:recipe_item, recipe_section: section, chart: build(:chart, repository: section.repository))

      {:ok, %{data: %{"recipe" => found}}} = run_query("""
        query Recipe($id: ID!) {
          recipe(id: $id) {
            id
            recipeSections {
              id
              recipeItems {
                id
                chart {
                  id
                }
              }
            }
          }
        }
      """, %{"id" => recipe.id}, %{current_user: insert(:user)})

      assert found["id"] == recipe.id

      found_section = hd(found["recipeSections"])
      assert found_section["id"] == section.id

      found_item = hd(found_section["recipeItems"])
      assert found_item["id"] == item.id
      assert found_item["chart"]["id"] == item.chart.id
    end
  end
end