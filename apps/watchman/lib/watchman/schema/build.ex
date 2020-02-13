defmodule Watchman.Schema.Build do
  use Piazza.Ecto.Schema

  defenum Type, deploy: 0, bounce: 1
  defenum Status, queued: 0, running: 1, successful: 2, failed: 3

  schema "builds" do
    field :repository,   :string
    field :type,         Type
    field :status,       Status
    field :completed_at, :utc_datetime_usec

    timestamps()
  end

  def for_repository(query \\ __MODULE__, repo) do
    from(b in query, where: b.repository == ^repo)
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]) do
    from(b in query, order_by: ^order)
  end

  def first(query \\ __MODULE__) do
    from(b in query, limit: 1)
  end

  def queued(query \\ __MODULE__) do
    from(b in query, where: b.status == ^:queued)
  end

  @valid ~w(repository type status completed_at)a

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> validate_required([:repository, :type, :status])
  end
end