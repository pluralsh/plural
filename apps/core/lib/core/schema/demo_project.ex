defmodule Core.Schema.DemoProject do
  use Piazza.Ecto.Schema
  alias Core.Schema.User

  @expiry [hours: -6]

  defenum State, created: 0, ready: 1, enabled: 2

  schema "demo_projects" do
    field :project_id,    :string
    field :state,         State
    field :credentials,   Piazza.Ecto.EncryptedString
    field :ready,         :boolean
    field :operation_id,  :string
    field :enabled_op_id, :string
    field :heartbeat,     :utc_datetime_usec

    belongs_to :user, User

    timestamps()
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :id]) do
    from(dp in query, order_by: ^order)
  end

  def dequeue(query \\ __MODULE__, amount \\ 20) do
    stale = Timex.now() |> Timex.shift(minutes: -30)
    from(r in query,
      where: is_nil(r.heartbeat) or r.heartbeat < ^stale,
      limit: ^amount
    )
  end

  def expired(query \\ __MODULE__) do
    expiry = Timex.now() |> Timex.shift(@expiry)
    from(dp in query, where: dp.inserted_at < ^expiry)
  end

  @valid ~w(project_id credentials user_id ready operation_id state enabled_op_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:user_id)
    |> unique_constraint(:project_id)
    |> validate_required([:project_id])
  end
end
