defmodule Core.Schema.DockerImage do
  use Piazza.Ecto.Schema
  alias Core.Schema.DockerRepository

  schema "docker_images" do
    field :tag,    :string
    field :digest, :string

    belongs_to :docker_repository, DockerRepository

    timestamps()
  end

  def for_repository(query \\ __MODULE__, repo_id),
    do: from(di in query, where: di.docker_repository_id == ^repo_id)

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]),
    do: from(di in query, order_by: ^order)

  @valid ~w(tag digest)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:repository_id)
    |> unique_constraint(:name, name: index_name(:docker_images, [:docker_repository_id, :tag]))
    |> validate_required([:docker_repository_id])
  end
end