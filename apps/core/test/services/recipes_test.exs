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
      dep1 = insert(:recipe, repository: other_repo)
      dep2 = insert(:recipe, repository: other_repo)

      {:ok, recipe} = Recipes.create(%{
        name: "recipe",
        dependencies: [%{name: dep1.name, repo: other_repo.name}, %{name: dep2.name, repo: other_repo.name}],
        tests: [
          %{type: :git, name: "test", message: "wtf", args: [%{name: "arg", repo: "console", key: "key"}]}
        ],
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

      [%{args: [arg]} = test] = recipe.tests
      assert test.type == :git
      assert test.name == "test"
      assert test.message == "wtf"
      assert arg.name == "arg"
      assert arg.repo == "console"
      assert arg.key   == "key"

      [first, second] = recipe.dependencies
      assert first.index == 0
      assert first.recipe_id == recipe.id
      assert first.dependent_recipe_id == dep1.id

      assert second.index == 1
      assert second.recipe_id == recipe.id
      assert second.dependent_recipe_id == dep2.id

      repo_section = Enum.find(recipe.recipe_sections, & &1.repository_id == repo.id)
      other_repo_section = Enum.find(recipe.recipe_sections, & &1.repository_id == other_repo.id)
      assert repo_section
      assert other_repo_section

      assert length(repo_section.configuration) == 1 # dedupes on the name "something"

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
            configuration: [%{type: :int, name: "something"}],
            items: [
              %{name: other_chart.name, type: :helm}
            ]
          }
        ]
      }, repo.id, user)


      verify_recipe.(recipe)

      other_repo_section = Enum.find(recipe.recipe_sections, & &1.repository_id == other_repo.id)
      assert length(other_repo_section.configuration) == 1

      {:ok, new} = Recipes.upsert(%{
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

      verify_recipe.(new)
      assert new.id == recipe.id
    end

    test "it can upsert when dependencies exist" do
      %{publisher: %{owner: user} = pub} = repo = insert(:repository)
      other_repo = insert(:repository, publisher: pub)
      chart = insert(:chart, repository: other_repo)
      other_chart = insert(:chart, repository: repo)

      {:ok, _} = Recipes.upsert(%{name: "dep", sections: [
        %{name: other_repo.name, items: [
          %{name: chart.name, type: :helm}
        ]}
      ]}, other_repo.id, user)

      {:ok, _} = Recipes.upsert(%{
        name: "recipe",
        dependencies: [
          %{repo: other_repo.name, name: "dep"}
        ],
        sections: [
          %{name: repo.name, items: [
            %{name: other_chart.name, type: :helm}
          ]}
        ]
      }, repo.id, user)

      {:ok, _} = Recipes.upsert(%{name: "dep", sections: [
        %{name: other_repo.name, items: [
          %{name: chart.name, type: :helm}
        ]}
      ]}, other_repo.id, user)
    end
  end

  describe "#delete" do
    test "Publishers can delete their recipes" do
      %{publisher: pub} = repo = insert(:repository)
      recipe = insert(:recipe, repository: repo)

      {:ok, del} = Recipes.delete(recipe.id, pub.owner)

      assert del.id == recipe.id
      refute refetch(recipe)
    end

    test "Nonpublishers cannot delete recipes" do
      recipe = insert(:recipe)
      {:error, _} = Recipes.delete(recipe.id, insert(:user))
    end
  end

  describe "#install" do
    setup [:setup_root_user]
    test "It can install all components in a recipe", %{user: user} do
      recipe = insert(:recipe, provider: :aws)
      %{repository: repo} = section = insert(:recipe_section, recipe: recipe)
      %{repository: repo2} = section2 = insert(:recipe_section, recipe: recipe)
      chart = insert(:chart, repository: repo)
      insert(:version, chart: chart, version: chart.latest_version)
      other_chart = insert(:chart, repository: repo2)
      insert(:version, chart: other_chart, version: other_chart.latest_version)
      tf = insert(:terraform, repository: repo2)
      insert(:version, terraform: tf, version: tf.latest_version, chart: nil)
      insert(:recipe_item, recipe_section: section, chart: chart)
      insert(:recipe_item, recipe_section: section2, terraform: tf)
      insert(:recipe_item, recipe_section: section2, chart: other_chart)

      {:ok, installations} = Recipes.install(recipe, %{repo.id => %{"some" => "context"}}, user)

      assert Enum.map(installations, & &1.repository_id) |> ids_equal([repo, repo2])
      assert Enum.find(installations, & &1.repository_id == repo.id).context == %{"some" => "context"}

      assert Charts.get_chart_installation(chart.id, user.id)
      assert Charts.get_chart_installation(other_chart.id, user.id)
      assert Terraform.get_terraform_installation(tf.id, user.id)

      # you can still install if previous installations are present
      {:ok, _} = Recipes.install(recipe, %{}, user)

      assert refetch(user).provider == :aws
    end
  end

  describe "#hydrate/1" do
    test "it can hydrate a depth > 2 tree of recipe dependencies" do
      recipe = insert(:recipe)
      secs = provision_recipe(recipe)

      %{recipe_sections: sections} = Recipes.hydrate(recipe)

      assert Enum.map(sections, & &1.id) == Enum.map(secs, & &1.id)
    end
  end

  describe "#create_stack/2" do
    test "users can create stacks" do
      user = insert(:user, account: build(:account))
      recipe1 = insert(:recipe)
      recipe2 = insert(:recipe)

      {:ok, %{collections: [collection]} = stack} = Recipes.create_stack(%{
        name: "stack",
        description: "a stack",
        collections: [%{provider: :aws, bundles: Enum.map([recipe1, recipe2], & %{name: &1.name, repo: &1.repository.name})}]
      }, user)

      assert stack.creator_id == user.id
      assert stack.account_id == user.account_id
      assert stack.name == "stack"
      assert stack.description == "a stack"

      assert collection.provider == :aws
      assert Enum.map(collection.bundles, & &1.recipe_id)
             |> ids_equal([recipe1, recipe2])
    end
  end

  describe "#delete_stack/2" do
    test "a stack creator can delete their stack" do
      user = insert(:user)
      stack = insert(:stack, creator: user)

      {:ok, del} = Recipes.delete_stack(stack.name, user)

      assert del.id == stack.id
      refute refetch(stack)
    end

    test "non creators cannot delete" do
      stack = insert(:stack)
      {:error, _} = Recipes.delete_stack(stack.name, insert(:user))
    end
  end

  describe "#hydrate/2" do
    test "it can hydrate all recipes for the given provider" do
      stack = insert(:stack)
      collection = insert(:stack_collection, provider: :aws, stack: stack)
      recipe = insert(:recipe)
      insert(:stack_recipe, collection: collection, recipe: recipe)
      secs = provision_recipe(recipe)

      {:ok, %{bundles: [%{recipe_sections: sections}]}} = Recipes.hydrate(stack, :aws)

      assert Enum.map(sections, & &1.id) == Enum.map(secs, & &1.id)
    end
  end

  defp provision_recipe(recipe) do
    %{repository: repo0} = section0 = insert(:recipe_section, recipe: recipe)
    insert(:recipe_item, recipe_section: section0, chart: build(:chart))

    [%{dependent_recipe: level_1_1}, %{dependent_recipe: level_1_2}] = for i <- 1..2,
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
    %{dependent_recipe: level_2_1} = insert(:recipe_dependency, recipe: level_1_1, index: 1)
    section3 = insert(:recipe_section, recipe: level_2_1)
    insert(:recipe_item, recipe_section: section3, chart: insert(:chart, dependencies: %{dependencies: [
      %{type: :helm, repo: repo2.name, name: "name"},
    ]}))

    [section0, section, section2, section3]
  end
end
