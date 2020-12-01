defmodule Core.Schema.Dependencies do
  use Piazza.Ecto.Schema

  defenum Provider, gcp: 0, aws: 1, azure: 2

  defmodule Dependency do
    use Piazza.Ecto.Schema
    defenum Type, terraform: 0, helm: 1

    embedded_schema do
      field :type,    Type
      field :repo,    :string
      field :name,    :string
      field :version, Core.Schema.VersionRequirement
      field :any,     {:array, :string}

      embeds_many :any_of, __MODULE__
    end

    @valid ~w(type repo name any version)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> cast_embed(:any_of)
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
    field :providers, {:array, Provider}
    field :provider_wirings, :map

    embeds_many :dependencies, Dependency, on_replace: :delete
    embeds_one  :wirings, Wirings, on_replace: :update
  end

  @valid ~w(providers provider_wirings)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:dependencies)
    |> cast_embed(:wirings)
  end
end