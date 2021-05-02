defmodule Core.Schema.Dependencies do
  use Piazza.Ecto.Schema

  defenum Provider, gcp: 0, aws: 1, azure: 2

  defmodule Dependency do
    use Piazza.Ecto.Schema

    defenum Type, terraform: 0, helm: 1

    embedded_schema do
      field :type,     Type
      field :repo,     :string
      field :name,     :string
      field :version,  Core.Schema.VersionRequirement
      field :optional, :boolean, default: false

      embeds_many :any_of, __MODULE__
    end

    @valid ~w(type repo name version optional)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> cast_embed(:any_of)
      |> validate_required([:type, :repo, :name, :version])
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
    field :providers,        {:array, Provider}
    field :provider_wirings, :map
    field :outputs,          :map
    field :application,      :boolean, default: false

    embeds_many :dependencies, Dependency, on_replace: :delete
    embeds_one  :wirings, Wirings, on_replace: :update
  end

  @valid ~w(providers provider_wirings application outputs)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:dependencies)
    |> cast_embed(:wirings)
  end
end
