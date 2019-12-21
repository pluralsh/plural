defmodule Core.Services.RecipesTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Recipes
  alias Core.Services.{Charts, Terraform}

  describe "#create" do
    test "It can create a multi-section recipe" do
      %{publisher: %{owner: user}} = repo = insert(:repository)
      chart = insert(:chart, repository: repo, dependencies: %{
        dependencies: [%{type: :terraform, name: "tf", repo: repo.name}]
      })
      tf = insert(:terraform, repository: repo, name: "tf")
      other_repo = insert(:repository)
      other_chart = insert(:chart, repository: other_repo)

      {:ok, recipe} = Recipes.create(%{
        name: "recipe",
        sections: [
          %{
            name: repo.name,
            items: [
              %{name: chart.name, type: :helm, configuration: [%{type: :int, name: "something"}]},
              %{name: tf.name, type: :terraform, configuration: [%{type: :int, name: "something"}]}
            ]
          },
          %{
            name: other_repo.name,
            items: [
              %{name: other_chart.name, type: :helm}
            ]
          }
        ]
      }, repo.id, user)

      assert recipe.repository_id == repo.id
      assert recipe.name == "recipe"

      repo_section = Enum.find(recipe.recipe_sections, & &1.repository_id == repo.id)
      other_repo_section = Enum.find(recipe.recipe_sections, & &1.repository_id == other_repo.id)
      assert repo_section
      assert other_repo_section

      [%{terraform: %{id: tf_id}}, %{chart: %{id: chart_id}} = helm] = repo_section.recipe_items
      assert tf_id == tf.id
      assert chart_id == chart.id
      assert hd(helm.configuration).name == "something"

      assert Enum.find(other_repo_section.recipe_items, & &1.chart_id == other_chart.id)
    end
  end

  describe "#upsert" do
    test "it will wipe existing recipes" do
      %{publisher: %{owner: user}} = repo = insert(:repository)
      chart = insert(:chart, repository: repo, dependencies: %{
        dependencies: [%{type: :terraform, name: "tf", repo: repo.name}]
      })
      tf = insert(:terraform, repository: repo, name: "tf")
      other_repo = insert(:repository)
      other_chart = insert(:chart, repository: other_repo)

      verify_recipe = fn recipe ->
        assert recipe.repository_id == repo.id
        assert recipe.name == "recipe"

        repo_section = Enum.find(recipe.recipe_sections, & &1.repository_id == repo.id)
        other_repo_section = Enum.find(recipe.recipe_sections, & &1.repository_id == other_repo.id)
        assert repo_section
        assert other_repo_section

        [%{terraform: %{id: tf_id}}, %{chart: %{id: chart_id}} = helm] = repo_section.recipe_items
        assert tf_id == tf.id
        assert chart_id == chart.id
        assert hd(helm.configuration).name == "something"

        assert Enum.find(other_repo_section.recipe_items, & &1.chart_id == other_chart.id)
      end

      {:ok, recipe} = Recipes.upsert(%{
        name: "recipe",
        sections: [
          %{
            name: repo.name,
            items: [
              %{name: chart.name, type: :helm, configuration: [%{type: :int, name: "something"}]},
              %{name: tf.name, type: :terraform, configuration: [%{type: :int, name: "something"}]}
            ]
          },
          %{
            name: other_repo.name,
            items: [
              %{name: other_chart.name, type: :helm}
            ]
          }
        ]
      }, repo.id, user)


      verify_recipe.(recipe)

      {:ok, recipe} = Recipes.upsert(%{
        name: "recipe",
        sections: [
          %{
            name: repo.name,
            items: [
              %{name: chart.name, type: :helm, configuration: [%{type: :int, name: "something"}]},
              %{name: tf.name, type: :terraform, configuration: [%{type: :int, name: "something"}]}
            ]
          },
          %{
            name: other_repo.name,
            items: [
              %{name: other_chart.name, type: :helm}
            ]
          }
        ]
      }, repo.id, user)

      verify_recipe.(recipe)
    end
  end

  describe "#install" do
    test "It can install all components in a recipe" do
      recipe = insert(:recipe)
      %{repository: repo} = section = insert(:recipe_section, recipe: recipe)
      %{repository: repo2} = section2 = insert(:recipe_section, recipe: recipe)
      chart = insert(:chart, repository: repo)
      insert(:version, chart: chart, version: chart.latest_version)
      other_chart = insert(:chart, repository: repo2)
      insert(:version, chart: other_chart, version: other_chart.latest_version)
      tf = insert(:terraform, repository: repo2)
      insert(:recipe_item, recipe_section: section, chart: chart)
      insert(:recipe_item, recipe_section: section2, terraform: tf)
      insert(:recipe_item, recipe_section: section2, chart: other_chart)

      user = insert(:user)
      {:ok, installations} = Recipes.install(recipe, %{repo.id => %{"some" => "context"}}, user)

      assert Enum.map(installations, & &1.repository_id) |> ids_equal([repo, repo2])
      assert Enum.find(installations, & &1.repository_id == repo.id).context == %{"some" => "context"}

      assert Charts.get_chart_installation(chart.id, user.id)
      assert Charts.get_chart_installation(other_chart.id, user.id)
      assert Terraform.get_terraform_installation(tf.id, user.id)

      # you can still install if previous installations are present
      {:ok, _} = Recipes.install(recipe, %{}, user)
    end
  end
end