defmodule Core.Schema.Recipe do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Repository, RecipeSection, RecipeDependency}

  defenum Provider, gcp: 0, aws: 1, azure: 2, custom: 3, kubernetes: 4

  schema "recipes" do
    field :name, :string
    field :description, :string
    field :provider, Provider

    belongs_to :repository, Repository
    has_many :recipe_sections, RecipeSection
    has_many :dependencies, RecipeDependency, on_replace: :delete, foreign_key: :recipe_id

    timestamps()
  end

  def for_repository(query \\ __MODULE__, repo_id),
    do: from(r in query, where: r.repository_id == ^repo_id)

  def for_provider(query \\ __MODULE__, provider),
    do: from(r in query, where: r.provider == ^provider)

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(r in query, order_by: ^order)

  @valid ~w(name description repository_id provider)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_assoc(:dependencies)
    |> foreign_key_constraint(:repository_id)
    |> unique_constraint(:name, index: index_name(:recipes, [:repository_id, :name]))
    |> validate_required([:name, :repository_id])
  end
end
