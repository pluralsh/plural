defmodule Core.Schema.Stack do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Account, User, StackCollection}

  schema "stacks" do
    field :name,        :string
    field :description, :string
    field :featured,    :boolean, default: :false
    field :bundles,     :map, virtual: true

    belongs_to :account,     Account
    belongs_to :creator,     User
    has_many :collections,   StackCollection, on_replace: :delete, foreign_key: :stack_id

    timestamps()
  end

  def featured(query \\ __MODULE__), do: from(s in query, where: s.featured)

  def for_account(query \\ __MODULE__, account_id) do
    from(s in query, where: s.account_id == ^account_id)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]) do
    from(s in query, order_by: ^order)
  end

  @valid ~w(name description featured)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_assoc(:collections)
    |> unique_constraint(:name)
    |> foreign_key_constraint(:account_id)
    |> foreign_key_constraint(:user_id)
    |> validate_required([:name, :description])
  end
end
