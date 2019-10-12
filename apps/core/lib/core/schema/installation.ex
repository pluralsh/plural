defmodule Core.Schema.Installation do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Repository, User}

  schema "installations" do
    belongs_to :user, User
    belongs_to :repository, Repository

    timestamps()
  end

  @valid ~w(user_id repository_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:user_id, :repository_id])
    |> unique_constraint(:repository_id, name: index_name(:installations, [:user_id, :repository_id]))
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:repository_id)
  end
end