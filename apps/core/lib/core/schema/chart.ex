defmodule Core.Schema.Chart do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Repository}

  schema "charts" do
    field :name,           :string
    field :latest_version, :string

    belongs_to :repository, Repository

    timestamps()
  end

  def for_repository(query \\ __MODULE__, repo_id) do
    from(c in query, where: c.repository_id == ^repo_id)
  end

  @valid ~w(name latest_version repository_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:name, name: index_name(:charts, [:repository_id, :name]))
    |> foreign_key_constraint(:repository_id)
    |> validate_required([:name, :latest_version])
    |> validate_length(:name, max: 255)
  end
end