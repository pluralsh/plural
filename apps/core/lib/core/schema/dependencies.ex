defmodule Core.Schema.Dependencies do
  use Piazza.Ecto.Schema

  defmodule Dependency do
    use Piazza.Ecto.Schema
    defenum Type, terraform: 0, helm: 1

    embedded_schema do
      field :type, Type
      field :repo, :string
      field :name, :string
    end

    @valid ~w(type repo name)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> validate_required([:type, :repo, :name])
    end
  end

  defmodule Wirings do
    use Piazza.Ecto.Schema

    embedded_schema do
      field :terraform, :map
      field :helm, :map
    end

    @valid ~w(terraform helm)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
    end
  end

  embedded_schema do
    embeds_many :dependencies, Dependency, on_replace: :delete
    embeds_one :wirings, Wirings, on_replace: :update
  end

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, [])
    |> cast_embed(:dependencies)
    |> cast_embed(:wirings)
  end
end