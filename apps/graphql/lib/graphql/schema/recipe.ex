defmodule GraphQl.Schema.Recipe do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{
    Recipe,
    Repository,
    Chart,
    Terraform
  }
  alias GraphQl.Middleware.{Accessible, Authenticated}

  ### INPUTS

  input_object :recipe_attributes do
    field :name,         non_null(:string)
    field :description,  :string
    field :provider,     :provider
    field :sections,     list_of(:recipe_section_attributes)
    field :dependencies, list_of(:recipe_dependency_attributes)
  end

  input_object :recipe_dependency_attributes do
    field :repo, non_null(:string)
    field :name, non_null(:string)
  end

  input_object :recipe_section_attributes do
    field :name,  non_null(:string)
    field :items, list_of(:recipe_item_attributes)
  end

  input_object :recipe_item_attributes do
    field :name,          non_null(:string)
    field :type,          non_null(:recipe_item_type)
    field :configuration, list_of(:recipe_configuration_attributes)
  end

  input_object :recipe_configuration_attributes do
    field :type,          non_null(:datatype)
    field :name,          non_null(:string)
    field :default,       :string
    field :documentation, :string
    field :placeholder,   :string
  end

  enum :recipe_item_type do
    value :helm
    value :terraform
  end

  ecto_enum :datatype, Core.Schema.RecipeItem.Configuration.Type
  ecto_enum :provider, Core.Schema.Recipe.Provider

  ### OBJECTS

  object :recipe do
    field :id,              :id
    field :name,            non_null(:string)
    field :description,     :string
    field :provider,        :provider
    field :repository,      :repository, resolve: dataloader(Repository)
    field :recipe_sections, list_of(:recipe_section)

    timestamps()
  end

  object :recipe_section do
    field :id,           :id
    field :repository,   :repository, resolve: dataloader(Repository)
    field :recipe,       :recipe, resolve: dataloader(Recipe)
    field :index,        :integer
    field :recipe_items, list_of(:recipe_item), resolve: dataloader(Recipe)

    timestamps()
  end

  object :recipe_item do
    field :id,             :id
    field :chart,          :chart, resolve: dataloader(Chart)
    field :terraform,      :terraform, resolve: dataloader(Terraform)
    field :recipe_section, :recipe_section, resolve: dataloader(Recipe)
    field :configuration,  list_of(:recipe_configuration)

    timestamps()
  end

  object :recipe_configuration do
    field :type,          :datatype
    field :name,          :string
    field :default,       :string
    field :documentation, :string
    field :placeholder,   :string
  end

  connection node_type: :recipe

  object :recipe_queries do
    field :recipe, :recipe do
      middleware Authenticated
      arg :id,   :id
      arg :name, :string
      arg :repo, :string

      resolve &Recipe.resolve_recipe/2
    end

    connection field :recipes, node_type: :recipe do
      middleware Authenticated
      middleware Accessible
      arg :repository_id,   :id
      arg :repository_name, :string
      arg :provider,        :provider

      resolve &Recipe.list_recipes/2
    end
  end

  object :recipe_mutations do
    field :create_recipe, :recipe do
      middleware Authenticated
      arg :repository_name, :string
      arg :repository_id,   :string
      arg :attributes,      non_null(:recipe_attributes)

      resolve safe_resolver(&Recipe.create_recipe/2)
    end

    field :delete_recipe, :recipe do
      middleware Authenticated
      arg :id, non_null(:id)

      resolve safe_resolver(&Recipe.delete_recipe/2)
    end

    field :install_recipe, list_of(:installation) do
      middleware Authenticated
      arg :recipe_id, non_null(:id)
      arg :context,   non_null(:map)

      resolve safe_resolver(&Recipe.install_recipe/2)
    end
  end
end
