defmodule Core.Schema.IncidentMessage do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User, Incident, Reaction, File}

  schema "incident_messages" do
    field :text, :binary
    field :structured_message, :map

    belongs_to :creator,   User
    belongs_to :incident,  Incident
    has_many   :reactions, Reaction, foreign_key: :message_id
    has_one    :file,      File, foreign_key: :message_id

    timestamps()
  end

  @valid ~w(text)a

  def for_incident(query \\ __MODULE__, incident_id) do
    from(m in query, where: m.incident_id == ^incident_id)
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]) do
    from(m in query, order_by: ^order)
  end

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:text, :creator_id, :incident_id])
    |> cast_assoc(:file)
  end
end
