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

    test "it can list recipes anonymously" do
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
      """, %{"id" => repo.id})

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

    test "it won't blow up when sideloading sections" do
      recipe = insert(:recipe)
      section = insert(:recipe_section, recipe: recipe)
      insert(:recipe_item, recipe_section: section, chart: build(:chart, repository: section.repository))

      {:ok, %{data: %{"recipes" => %{"edges" => [%{"node" => r}]}}}} = run_query("""
        query Recipes($id: ID!) {
          recipes(repositoryId: $id, first: 5) {
            edges {
              node {
                recipeSections { id }
              }
            }
          }
        }
      """, %{"id" => recipe.repository.id}, %{current_user: insert(:user)})

      assert hd(r["recipeSections"])["id"] == section.id
    end
  end

  describe "recipe" do
    test "It will fetch a recipe" do
      recipe = insert(:recipe)
      %{sections: [section | _] = sections, dependencies: deps} = provision_recipe(recipe)
      item = insert(:recipe_item, recipe_section: section, chart: build(:chart, repository: section.repository))

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

      assert Enum.map(found["recipeSections"], & &1["id"]) == Enum.map(sections, & &1.id)

      found_section = Enum.find(found["recipeSections"], & &1["id"] == section.id)
      found_item = Enum.find(found_section["recipeItems"], & &1["id"] == item.id)
      assert found_item["chart"]["id"] == item.chart.id

      assert Enum.map(deps, & &1.dependent_recipe)
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

  describe "stack" do
    test "it can fetch and hydrate a stack" do
      stack = insert(:stack, featured: true)
      collection = insert(:stack_collection, stack: stack, provider: :aws)
      recipes = insert_list(3, :stack_recipe, collection: collection)
                |> Enum.map(& &1.recipe)
      sections = for r <- recipes, do: insert(:recipe_section, recipe: r)

      {:ok, %{data: %{"stack" => found}}} = run_query("""
        query Stack($name: String!) {
          stack(name: $name, provider: AWS) {
            id
            bundles { id }
            sections { id }
          }
        }
      """, %{"name" => stack.name}, %{current_user: insert(:user)})

      assert found["id"] == stack.id
      assert ids_equal(found["bundles"], recipes)
      assert ids_equal(found["sections"], sections)
    end
  end

  describe "stacks" do
    test "it can list featured stacks" do
      stacks = insert_list(3, :stack, featured: true)
      insert_list(2, :stack, featured: false)

      {:ok, %{data: %{"stacks" => found}}} = run_query("""
        query {
          stacks(featured: true, first: 10) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(stacks)
    end
  end

  defp provision_recipe(recipe) do
    %{repository: repo0} = section0 = insert(:recipe_section, recipe: recipe)
    insert(:recipe_item, recipe_section: section0, chart: build(:chart))

    [%{dependent_recipe: level_1_1}, %{dependent_recipe: level_1_2}] = dependencies = for i <- 1..2,
      do: insert(:recipe_dependency, recipe: recipe, index: i)
    %{repository: repo} = section = insert(:recipe_section, recipe: level_1_1)
    %{repository: repo2} = section2 = insert(:recipe_section, recipe: level_1_2)
    insert(:recipe_item, recipe_section: section, chart: insert(:chart, dependencies: %{dependencies: [
      %{type: :terraform, repo: repo.name, name: "name"},
      %{type: :helm, repo: repo0.name, name: "zero"},
    ]}))
    insert(:recipe_item, recipe_section: section2, terraform: insert(:terraform, dependencies: %{dependencies: [
      %{type: :helm, repo: repo.name, name: "another-name"},
    ]}))
    %{dependent_recipe: level_2_1} = dep = insert(:recipe_dependency, recipe: level_1_1, index: 1)
    section3 = insert(:recipe_section, recipe: level_2_1)
    insert(:recipe_item, recipe_section: section3, chart: insert(:chart, dependencies: %{dependencies: [
      %{type: :helm, repo: repo2.name, name: "name"},
    ]}))

    %{sections: [section0, section, section2, section3], dependencies: [dep | dependencies]}
  end
end
