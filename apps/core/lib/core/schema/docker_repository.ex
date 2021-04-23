defmodule Core.Schema.DockerRepository do
  use Piazza.Ecto.Schema
  alias Core.Schema.Repository

  schema "docker_repositories" do
    field :name, :string
    belongs_to :repository, Repository

    timestamps()
  end

  def for_repository_name(query \\ __MODULE__, repo_name) do
    from(dr in query,
      join: r in assoc(dr, :repository),
      where: r.name == ^repo_name
    )
  end

  def for_name(query \\ __MODULE__, name) do
    from(dr in query, where: dr.name == ^name)
  end

  def for_repository(query \\ __MODULE__, repo_id),
    do: from(dr in query, where: dr.repository_id == ^repo_id)

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(dr in query, order_by: ^order)

  @valid ~w(name)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:repository_id)
    |> unique_constraint(:name, name: index_name(:docker_repositories, [:repository_id, :name]))
    |> validate_required([:name, :repository_id])
  end
end
