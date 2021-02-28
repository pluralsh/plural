defmodule Core.Schema.Incident do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Repository, User, Tag, IncidentHistory}

  defenum Status, open: 0, in_progress: 1, resolved: 2, completed: 3

  schema "incidents" do
    field :title,            :string
    field :description,      :binary
    field :severity,         :integer
    field :status,           Status
    field :next_response_at, :utc_datetime_usec

    belongs_to :repository, Repository
    belongs_to :creator,    User
    belongs_to :owner,      User

    has_many :history, IncidentHistory
    has_many :tags, Tag,
      where: [resource_type: :incident],
      foreign_key: :resource_id,
      on_replace: :delete

    timestamps()
  end

  @valid ~w(title description severity owner_id status)a

  def search(query \\ __MODULE__, q) do
    from(i in query, where: ilike(i.title, ^"%#{q}%"))
  end

  def for_repository(query \\ __MODULE__, repo_id) do
    from(i in query, where: i.repository_id == ^repo_id)
  end

  def for_creator(query \\ __MODULE__, user_id) do
    from(i in query, where: i.creator_id == ^user_id)
  end

  def for_owner(query \\ __MODULE__, user_id) do
    from(i in query, where: i.owner_id == ^user_id)
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]) do
    from(i in query, order_by: ^order)
  end

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_assoc(:tags, with: &Tag.tag_changeset(&1, &2, :incident))
    |> validate_required([:title, :severity, :repository_id, :creator_id])
    |> validate_number(:severity, greater_than_or_equal_to: 0, less_than_or_equal_to: 5, message: "must be between 0 and 5")
  end
end
