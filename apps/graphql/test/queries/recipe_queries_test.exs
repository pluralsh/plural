defmodule GraphQl.RecipeQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "recipes" do
    test "It will list recipes for a repo" do
      repo    = insert(:repository)
      recipes = insert_list(3, :recipe, repository: repo)
      insert(:recipe, private: true, repository: repo)
      insert(:recipe)

      {:ok, %{data: %{"recipes" => found}}} = run_query("""
        query Recipes($id: ID!) {
          recipes(repositoryId: $id, first: 5) {
            edges { node { id } }
          }
        }
      """, %{"id" => repo.id}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(recipes)
    end

    test "It will list recipes for a repo by repo name" do
      repo    = insert(:repository)
      recipes = insert_list(3, :recipe, repository: repo)
      insert(:recipe)

      {:ok, %{data: %{"recipes" => found}}} = run_query("""
        query Recipes($name: String!) {
          recipes(repositoryName: $name, first: 5) {
            edges { node { id } }
          }
        }
      """, %{"name" => repo.name}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(recipes)
    end

    test "it can filter recipes by provider" do
      repo    = insert(:repository)
      recipes = insert_list(3, :recipe, repository: repo, provider: :aws)
      insert(:recipe, repository: repo, provider: :gcp)

      {:ok, %{data: %{"recipes" => found}}} = run_query("""
        query Recipes($name: String!) {
          recipes(repositoryName: $name, first: 5, provider: AWS) {
            edges { node { id } }
          }
        }
      """, %{"name" => repo.name}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(recipes)
    end

    test "it will have a descriptive error if no name or id is given" do
      repo    = insert(:repository)
      insert_list(3, :recipe, repository: repo, provider: :aws)

      {:ok, %{errors: [%{message: message}]}} = run_query("""
        query {
          recipes(first: 5) {
            edges { node { id } }
          }
        }
      """, %{"name" => repo.name}, %{current_user: insert(:user)})

      assert message == "one of repositoryId or repositoryName are required"
    end
  end

  describe "recipe" do
    test "It will fetch a recipe" do
      recipe = insert(:recipe)
      section = insert(:recipe_section, recipe: recipe)
      item = insert(:recipe_item, recipe_section: section, chart: build(:chart, repository: section.repository))
      dep  = insert(:recipe_dependency, recipe: recipe, index: 1)
      dep2 = insert(:recipe_dependency, recipe: dep.dependent_recipe, index: 1)
      dep3 = insert(:recipe_dependency, recipe: recipe, index: 2)

      {:ok, %{data: %{"recipe" => found}}} = run_query("""
        query Recipe($id: ID!) {
          recipe(id: $id) {
            id
            recipeDependencies { id }
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

      assert Enum.map([dep, dep2, dep3], & &1.dependent_recipe)
             |> ids_equal(found["recipeDependencies"])
    end

    test "It will fetch a recipe by name" do
      recipe = insert(:recipe)
      section = insert(:recipe_section, recipe: recipe)
      item = insert(:recipe_item, recipe_section: section, chart: build(:chart, repository: section.repository))

      {:ok, %{data: %{"recipe" => found}}} = run_query("""
        query Recipe($name: String, $repo: String) {
          recipe(name: $name, repo: $repo) {
            id
            recipeSections {
              id
              recipeItems {
                id
                chart { id }
              }
            }
          }
        }
      """, %{"name" => recipe.name, "repo" => recipe.repository.name}, %{current_user: insert(:user)})

      assert found["id"] == recipe.id

      found_section = hd(found["recipeSections"])
      assert found_section["id"] == section.id

      found_item = hd(found_section["recipeItems"])
      assert found_item["id"] == item.id
      assert found_item["chart"]["id"] == item.chart.id
    end
  end
end
