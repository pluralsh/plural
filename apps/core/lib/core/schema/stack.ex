defmodule Core.Schema.Stack do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Account, User, StackCollection, Repository}

  schema "stacks" do
    field :name,        :string
    field :description, :string
    field :featured,    :boolean, default: :false
    field :bundles,     :map, virtual: true
    field :expires_at,  :utc_datetime_usec

    belongs_to :account,     Account
    belongs_to :creator,     User
    has_many :collections,   StackCollection, on_replace: :delete, foreign_key: :stack_id

    embeds_one :community, Repository.Community, on_replace: :update

    timestamps()
  end

  def featured(query \\ __MODULE__), do: from(s in query, where: s.featured)

  def expired(query \\ __MODULE__) do
    now = Timex.now()
    from(s in query, where: s.expires_at < ^now)
  end

  def for_account(query \\ __MODULE__, account_id) do
    from(s in query, where: s.account_id == ^account_id)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]) do
    from(s in query, order_by: ^order)
  end

  @valid ~w(name description featured expires_at)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:community, with: &Repository.community_changeset/2)
    |> cast_assoc(:collections)
    |> unique_constraint(:name)
    |> foreign_key_constraint(:account_id)
    |> foreign_key_constraint(:user_id)
    |> validate_required([:name, :description])
  end
end
