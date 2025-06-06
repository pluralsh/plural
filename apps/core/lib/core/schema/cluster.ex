defmodule Core.Schema.Cluster do
  use Piazza.Ecto.Schema
  alias Core.Schema.{
    User,
    Account,
    UpgradeQueue,
    Recipe.Provider,
    ClusterDependency,
    Installation.Source
  }

  @expiry 1

  schema "clusters" do
    field :provider,      Provider
    field :name,          :string
    field :console_url,   :string
    field :source,        Source
    field :git_url,       :string
    field :domain,        :string
    field :pinged_at,     :utc_datetime_usec
    field :service_count, :integer
    field :cluster_count, :integer
    field :legacy,        :boolean

    belongs_to :owner,   User
    belongs_to :account, Account

    has_one :queue,      UpgradeQueue
    has_one :dependency, ClusterDependency

    timestamps()
  end

  def active(query \\ __MODULE__) do
    expired = expiry()
    from(q in query, where: q.pinged_at >= ^expired or (is_nil(q.pinged_at) and q.inserted_at >= ^expired))
  end

  def expired(query \\ __MODULE__) do
    expired = expiry()
    from(q in query, where: q.pinged_at < ^expired or is_nil(q.pinged_at))
  end

  defp expiry() do
    Timex.now()
    |> Timex.shift(days: -@expiry)
  end

  def for_expired_queue(query \\ __MODULE__) do
    expired = UpgradeQueue.expired()
    from(c in query,
      join: q in subquery(expired),
        on: q.cluster_id == c.id
    )
  end

  def for_user(query \\ __MODULE__, user)

  def for_user(query, %User{id: uid, account: %{root_user_id: uid}, account_id: aid}),
    do: for_account(query, aid)

  def for_user(query, %User{roles: %{admin: true}, account_id: aid}), do: for_account(query, aid)

  def for_user(query, %User{id: user_id, account_id: account_id} = user) do
    accessible = User.accessible(user)
    from(c in query,
      left_join: u in subquery(accessible),
      where: c.account_id == ^account_id and (c.owner_id == ^user_id or c.owner_id == u.id),
      distinct: true
    )
  end

  def for_user(query, user_id) when is_binary(user_id) do
    from(c in query, where: c.owner_id == ^user_id)
  end

  def for_account(query \\ __MODULE__, account_id) do
    from(c in query, where: c.account_id == ^account_id)
  end

  def services(query \\ __MODULE__) do
    from(c in query, select: sum(c.service_count))
  end

  def clusters(query \\ __MODULE__) do
    from(c in query, select: sum(c.cluster_count))
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]) do
    from(c in query, order_by: ^order)
  end

  @valid ~w(owner_id legacy account_id provider name domain console_url source git_url pinged_at service_count cluster_count)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:owner_id)
    |> foreign_key_constraint(:owner_id)
    |> foreign_key_constraint(:account_id)
    |> unique_constraint(:name, name: index_name(:clusters, [:owner_id, :provider, :name]))
    |> validate_required([:name, :provider, :owner_id, :account_id])
  end
end
