defmodule Core.Schema.Rollout do
  use Piazza.Ecto.Schema
  alias Piazza.Ecto.UUID
  alias Core.Schema.{Repository}

  defenum Status, queued: 0, running: 1, finished: 2

  schema "rollouts" do
    field :status,        Status, default: :queued
    field :event,         Piazza.Ecto.Types.Erlang
    field :cursor,        :binary_id
    field :heartbeat,     :utc_datetime_usec
    field :count,         :integer, default: 0

    belongs_to :repository, Repository

    timestamps()
  end

  def can_dequeue(query \\ __MODULE__) do
    from(r in query, where: r.status == ^:queued or r.status == ^:running)
  end

  def dequeue(query \\ __MODULE__) do
    stale = Timex.now() |> Timex.shift(minutes: -5)
    from(r in query,
      join: d in subquery(to_dequeue()),
        on: d.first == r.id,
      where: r.status == ^:queued or (not is_nil(r.heartbeat) and r.heartbeat < ^stale),
      limit: 20
    )
  end

  def to_dequeue(query \\ __MODULE__) do
    from(r in query,
      where: r.status in ^[:queued, :running],
      group_by: r.repository_id,
      select: %{repository_id: r.repository_id, first: min(r.id)}
    )
  end

  @valid ~w(status cursor heartbeat count)a

  def create_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, [:event, :repository_id, :status])
    |> put_change(:id, UUID.generate_monotonic())
    |> foreign_key_constraint(:repository_id)
    |> validate_required([:repository_id, :event, :status])
  end

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:cursor, :status, :heartbeat])
  end
end
