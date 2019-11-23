defmodule Core.Schema.Installation do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Repository, User}

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

    embeds_one :policy, Policy, on_replace: :update
    belongs_to :user, User
    belongs_to :repository, Repository

    timestamps()
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]),
    do: from(i in query, order_by: ^order)

  def for_user(query \\ __MODULE__, user_id),
    do: from(i in query, where: i.user_id == ^user_id)

  @valid ~w(user_id repository_id context)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:user_id, :repository_id])
    |> unique_constraint(:repository_id, name: index_name(:installations, [:user_id, :repository_id]))
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:repository_id)
  end
end