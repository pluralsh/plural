defmodule Core.Schema.Tag do
  use Piazza.Ecto.Schema

  alias Core.Schema.{Integration}

  defenum ResourceType, integration: 0, repository: 1, incident: 2

  schema "tags" do
    field :tag, :string
    field :resource_type, ResourceType
    field :resource_id, :binary_id

    timestamps()
  end

  def search(query \\ __MODULE__, search) do
    from(t in query, where: like(t.tag, ^"#{search}%"))
  end

  def integration_tags(query \\ __MODULE__, repo_id) do
    from(t in query,
      join: i in Integration,
        on: t.resource_id == i.id,
      where: t.resource_type == ^:integration and i.repository_id == ^repo_id
    )
  end

  def repository_tags(query \\ __MODULE__) do
    from(t in query,
      where: t.resource_type == ^:repository)
  end

  def grouped(query \\ __MODULE__) do
    from(t in query,
      group_by: t.tag,
      select: %{tag: t.tag, count: count(t.id)}
    )
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :tag]),
    do: from(t in query, order_by: ^order)

  @valid ~w(tag)a

  def tag_changeset(model, attrs, type) do
    model
    |> cast(attrs, @valid)
    |> put_change(:resource_type, type)
    |> validate_required([:tag, :resource_type])
  end
end
