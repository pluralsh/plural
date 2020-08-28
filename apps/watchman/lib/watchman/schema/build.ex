defmodule Watchman.Schema.Build do
  use Piazza.Ecto.Schema
  alias Watchman.Schema.Command

  @expiry 1

  defenum Type, deploy: 0, bounce: 1
  defenum Status, queued: 0, running: 1, successful: 2, failed: 3, cancelled: 4

  schema "builds" do
    field :repository,   :string
    field :type,         Type
    field :status,       Status
    field :message,      :string
    field :completed_at, :utc_datetime_usec

    has_many :commands, Command

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

  def expired(query \\ __MODULE__) do
    expiry = Timex.now() |> Timex.shift(days: -@expiry)
    from(b in query, where: b.inserted_at <= ^expiry)
  end

  @valid ~w(repository type status completed_at message)a

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> validate_required([:repository, :type, :status])
  end
end