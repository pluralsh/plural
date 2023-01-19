defmodule Core.Schema.Cluster do
  use Piazza.Ecto.Schema
  alias Core.Schema.{
    User,
    Account,
    UpgradeQueue,
    Recipe.Provider,
    Installation.Source
  }

  schema "clusters" do
    field :provider,    Provider
    field :name,        :string
    field :console_url, :string
    field :source,      Source
    field :git_url,     :string
    field :domain,      :string
    field :pinged_at,   :utc_datetime_usec

    belongs_to :owner,   User
    belongs_to :account, Account
    has_one :queue,      UpgradeQueue

    timestamps()
  end

  def for_user(query \\ __MODULE__, %User{id: user_id, account_id: account_id} = user) do
    accessible = User.accessible(user)
    from(c in query,
      left_join: u in subquery(accessible),
      where: c.account_id == ^account_id and (c.owner_id == ^user_id or c.owner_id == u.id),
      distinct: true
    )
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]) do
    from(c in query, order_by: ^order)
  end

  @valid ~w(owner_id account_id provider name domain console_url source git_url pinged_at)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:owner_id)
    |> foreign_key_constraint(:account_id)
    |> unique_constraint(:name, name: index_name(:clusters, [:account_id, :provider, :name]))
    |> validate_required([:name, :provider, :owner_id, :account_id])
  end
end
