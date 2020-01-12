defmodule Core.Schema.Installation do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Repository, User, Subscription}

  defmodule Policy do
    use Piazza.Ecto.Schema

    embedded_schema do
      field :free, :boolean, default: true
    end

    @valid ~w(free)

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
    end
  end

  schema "installations" do
    field :context, :map
    field :auto_upgrade, :boolean, default: false

    embeds_one :policy,     Policy, on_replace: :update
    belongs_to :user,       User
    belongs_to :repository, Repository
    has_one :subscription,  Subscription

    timestamps()
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]),
    do: from(i in query, order_by: ^order)

  def for_user(query \\ __MODULE__, user_id),
    do: from(i in query, where: i.user_id == ^user_id)

  @valid ~w(user_id repository_id context auto_upgrade)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:user_id, :repository_id])
    |> unique_constraint(:repository_id, name: index_name(:installations, [:user_id, :repository_id]))
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:repository_id)
  end
end