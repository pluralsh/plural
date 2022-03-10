defmodule Core.Schema.RecipeTest do
  use Piazza.Ecto.Schema

  defenum Type, git: 0

  embedded_schema do
    field :type, Type
    field :name,    :string
    field :message, :string

    embeds_many :args, Argument, on_replace: :delete do
      field :name, :string
      field :path, {:array, :string}
    end
  end

  @valid ~w(type name message)a

  def argument_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, [:path, :name])
    |> validate_required([:path, :name])
  end

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:args, with: &argument_changeset/2)
    |> validate_required([:type, :name])
  end
end
