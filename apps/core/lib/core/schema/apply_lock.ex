defmodule Core.Schema.ApplyLock do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Repository, User}

  schema "apply_locks" do
    field :lock, :binary

    belongs_to :repository, Repository
    belongs_to :owner, User

    timestamps()
  end

  @valid ~w(lock repository_id owner_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:repository_id)
    |> foreign_key_constraint(:repository_id)
    |> foreign_key_constraint(:owner_id)
    |> validate_required([:repository_id])
  end
end
