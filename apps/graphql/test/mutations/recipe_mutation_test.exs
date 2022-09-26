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

      third_repo = insert(:repository)
      recipe = insert(:recipe, repository: third_repo)
      section = insert(:recipe_section, recipe: recipe, repository: third_repo, index: 1)
      third_chart = insert(:chart, repository: third_repo)
      insert(:recipe_item, recipe_section: section, chart: third_chart)

      attrs = %{
        name: "recipe",
        dependencies: [%{name: recipe.name, repo: third_repo.name}],
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
             |> ids_equal([repo, other_repo, third_repo])

      items = Enum.flat_map(sections, & &1["recipeItems"])
      assert Enum.map(items, & &1["chart"])
             |> Enum.filter(& &1)
             |> ids_equal([chart, other_chart, third_chart])

      assert Enum.map(items, & &1["terraform"])
             |> Enum.filter(& &1)
             |> ids_equal([tf])
    end
  end

  describe "deleteRecipe" do
    test "Publishers can delete recipes" do
      %{publisher: pub} = repo = insert(:repository)
      recipe = insert(:recipe, repository: repo)

      {:ok, %{data: %{"deleteRecipe" => del}}} = run_query("""
        mutation DeleteRecipe($id: ID!) {
          deleteRecipe(id: $id) {
            id
          }
        }
      """, %{"id" => recipe.id}, %{current_user: pub.owner})

      assert del["id"] == recipe.id
      refute refetch(recipe)
    end
  end

  describe "installRecipe" do
    setup [:setup_root_user]
    test "You can install recipes", %{user: user} do
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
      """, %{"id" => recipe.id, "context" => Jason.encode!(%{repo.id => %{"some" => "value"}})}, %{current_user: user})

      assert installation["repository"]["id"] == repo.id
    end
  end

  describe "createStack" do
    test "it can create a new stack instance" do
      recipe = insert(:recipe)
      {:ok, %{data: %{"createStack" => create}}} = run_query("""
        mutation Create($attributes: StackAttributes!) {
          createStack(attributes: $attributes) {
            id
            name
            featured
            description
            collections {
              provider
              bundles { recipe { id } }
            }
          }
        }
      """, %{"attributes" => %{
        "name" => "stack",
        "description" => "a description",
        "featured" => true,
        "collections" => [
          %{"provider" => "AWS", "bundles" => [%{"name" => recipe.name, "repo" => recipe.repository.name}]}
        ]
      }}, %{current_user: insert(:user)})

      assert create["name"] == "stack"
      assert create["description"] == "a description"
      assert create["featured"]

      [%{"provider" => "AWS", "bundles" => [bundle]}] = create["collections"]
      assert bundle["recipe"]["id"] == recipe.id
    end
  end

  describe "deleteStack" do
    test "a creator can delete their stack" do
      user = insert(:user)
      stack = insert(:stack, creator: user)

      {:ok, %{data: %{"deleteStack" => del}}} = run_query("""
        mutation Delete($name: String!) {
          deleteStack(name: $name) { id }
        }
      """, %{"name" => stack.name}, %{current_user: user})

      assert del["id"] == stack.id
      refute refetch(stack)
    end
  end

  describe "quickStack" do
    test "it can create a quick stack for a list of repositories" do
      repos = insert_list(3, :repository)
      for r <- repos, do: insert(:recipe, repository: r, provider: :aws)
      user = insert(:user)

      {:ok, %{data: %{"quickStack" => s}}} = run_query("""
        mutation Quick($ids: [ID], $provider: Provider!) {
          quickStack(repositoryIds: $ids, provider: $provider) {
            name
          }
        }
      """, %{"ids" => Enum.map(repos, & &1.id), "provider" => "AWS"}, %{current_user: user})

      assert s["name"]
    end
  end
end
