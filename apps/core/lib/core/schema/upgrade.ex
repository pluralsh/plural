defmodule Core.Schema.Upgrade do
  use Piazza.Ecto.Schema
  alias Core.Schema.{UpgradeQueue, Repository}
  alias Piazza.Ecto.UUID

  defenum Type, deploy: 0, approval: 1

  schema "upgrades" do
    field :type,    Type
    field :message, :string

    belongs_to :queue,      UpgradeQueue
    belongs_to :repository, Repository

    timestamps()
  end

  def after_seq(query \\ __MODULE__, id)
  def after_seq(query, nil), do: query
  def after_seq(query, id) do
    from(u in query, where: u.id > ^id)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :id]) do
    from(u in query, order_by: ^order)
  end

  def limit(query \\ __MODULE__, limit \\ 1) do
    from(u in query, limit: ^limit)
  end

  def for_queue(query \\ __MODULE__, id) do
    from(u in query, where: u.queue_id == ^id)
  end

  @valid ~w(type message repository_id queue_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> put_change(:id, UUID.generate_monotonic())
    |> validate_length(:message, max: 10_000)
    |> foreign_key_constraint(:queue_id)
    |> foreign_key_constraint(:repository_id)
    |> validate_required([:queue_id, :repository_id])
  end
end
