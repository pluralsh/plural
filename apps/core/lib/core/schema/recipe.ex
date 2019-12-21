defmodule Core.Schema.Recipe do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Repository, RecipeSection}

  defenum Provider, gcp: 0, aws: 1, azure: 2

  schema "recipes" do
    field :name, :string
    field :description, :string
    field :provider, Provider

    belongs_to :repository, Repository
    has_many :recipe_sections, RecipeSection

    timestamps()
  end

  def for_repository(query \\ __MODULE__, repo_id),
    do: from(r in query, where: r.repository_id == ^repo_id)

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(r in query, order_by: ^order)

  @valid ~w(name description repository_id provider)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:repository_id)
    |> unique_constraint(:name, index: index_name(:recipes, [:repository_id, :name]))
    |> validate_required([:name, :repository_id])
  end
end