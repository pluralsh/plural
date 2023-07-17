defmodule Core.Schema.Notification do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User, Incident, IncidentMessage, Repository}

  defenum Type, message: 0, incident_update: 1, mention: 2, locked: 3, pending: 4

  schema "notifications" do
    field :type, Type
    field :msg,  :binary
    field :cli,  :boolean

    belongs_to :incident,   Incident
    belongs_to :user,       User
    belongs_to :actor,      User
    belongs_to :message,    IncidentMessage
    belongs_to :repository, Repository

    timestamps()
  end

  def for_type(query \\ __MODULE__, type) do
    from(n in query, where: n.type == ^type)
  end

  def for_repository(query \\ __MODULE__, repo_id) do
    from(n in query, where: n.repository_id == ^repo_id)
  end

  def for_user(query \\ __MODULE__, user_id) do
    from(n in query, where: n.user_id == ^user_id)
  end

  def for_incident(query \\ __MODULE__, incident_id) do
    from(n in query, where: n.incident_id == ^incident_id)
  end

  def cli(query \\ __MODULE__) do
    from(n in query, where: n.cli)
  end

  def preloaded(query \\ __MODULE__, preloads) do
    from(n in query, preload: ^preloads)
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]) do
    from(n in query, order_by: ^order)
  end

  @valid ~w(type incident_id user_id actor_id repository_id msg cli)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:user_id, :actor_id, :type])
    |> foreign_key_constraint(:incident_id)
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:actor_id)
    |> foreign_key_constraint(:repository_id)
  end
end
