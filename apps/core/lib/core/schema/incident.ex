defmodule Core.Schema.Incident do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Repository, User, Tag, IncidentHistory, Postmortem, Notification, Follower, Installation, ClusterInformation}

  defenum Status, open: 0, in_progress: 1, resolved: 2, complete: 3

  schema "incidents" do
    field :title,            :string
    field :description,      :binary
    field :severity,         :integer
    field :status,           Status
    field :next_response_at, :utc_datetime_usec

    belongs_to :repository, Repository
    belongs_to :creator,    User
    belongs_to :owner,      User

    has_one  :postmortem, Postmortem
    has_one  :cluster_information, ClusterInformation
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

  def following(query \\ __MODULE__, user_id) do
    from(i in query,
      join: f in ^Follower.for_user(user_id),
        on: f.incident_id == i.id
    )
  end

  def supported(query \\ __MODULE__, user) do
    supported_query = Repository.supported(user)
    from(i in query,
      join: r in subquery(supported_query),
        on: i.repository_id == r.id
    )
  end

  def with_notifications(query \\ __MODULE__, user_id) do
    notifs = from(
      f in Notification.for_user(user_id),
      select: f.incident_id,
      distinct: :incident_id
    )

    from(i in query,
      join: n in subquery(notifs),
        on: n.incident_id == i.id
    )
  end

  def for_tag(query \\ __MODULE__, tag) do
    from(i in query,
      join: t in assoc(i, :tags),
      where: t.tag == ^tag
    )
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]) do
    from(i in query, order_by: ^order)
  end

  def sideload_subscriptions(query \\ __MODULE__) do
    from(i in query,
      left_join: inst in Installation,
        on: i.repository_id == inst.repository_id and i.creator_id == inst.user_id,
      left_join: s in assoc(inst, :subscription),
      select: {i.id, s}
    )
  end

  def unread_notification_count(query \\ __MODULE__, user_id) do
    from(i in query,
      left_join: n in ^Notification.for_user(user_id),
        on: n.incident_id == i.id,
      group_by: i.id,
      select: {i.id, count(n.id)})
  end

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_assoc(:tags, with: &Tag.tag_changeset(&1, &2, :incident))
    |> cast_assoc(:cluster_information)
    |> validate_required([:title, :severity, :repository_id, :creator_id, :status])
    |> validate_number(:severity, greater_than_or_equal_to: 0, less_than_or_equal_to: 5, message: "must be between 0 and 5")
  end

  def complete_changeset(model, attrs \\ %{})

  def complete_changeset(%__MODULE__{status: :resolved} = model, attrs) do
    model
    |> cast(attrs, [:status])
    |> cast_assoc(:postmortem)
    |> validate_required([:status])
  end

  def complete_changeset(model, _) do
    model
    |> change(%{})
    |> add_error(:status, "status must be resolved before complete")
  end
end
