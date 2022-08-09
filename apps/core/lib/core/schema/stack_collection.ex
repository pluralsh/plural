defmodule Core.Schema.StackCollection do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Stack, StackRecipe, Recipe}

  schema "stack_collections" do
    field :provider, Recipe.Provider

    belongs_to :stack,   Stack
    has_many   :bundles, StackRecipe, on_replace: :delete, foreign_key: :collection_id

    timestamps()
  end

  @valid ~w(provider stack_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_assoc(:bundles)
    |> unique_constraint(:stack_id, name: index_name(:stack_collections, [:stack_id, :provider]))
    |> foreign_key_constraint(:stack_id)
  end
end
