defmodule Core.Schema.Follower do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Incident, User}

  def preferences(), do: __MODULE__.Preferences.__schema__(:fields) -- [:id]

  schema "followers" do
    belongs_to :user, User
    belongs_to :incident, Incident

    embeds_one :preferences, Preferences, on_replace: :update do
      boolean_fields [:message, :incident_update]
    end

    timestamps()
  end

  def for_user(query \\ __MODULE__, user_id) do
    from(f in query, where: f.user_id == ^user_id)
  end

  def for_incident(query \\ __MODULE__, incident_id) do
    from(f in query, where: f.incident_id == ^incident_id)
  end

  @valid ~w(user_id incident_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:preferences, with: &preference_changeset/2)
    |> validate_required([:user_id, :incident_id])
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:incident_id)
    |> unique_constraint(:user_id, name: index_name(:followers, [:incident_id, :user_id]))
  end

  def preference_changeset(model, attrs) do
    model
    |> cast(attrs, preferences())
  end
end
