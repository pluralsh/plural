defmodule Core.Schema.Contributor do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User, Repository}

  schema "contributors" do
    belongs_to :user, User
    belongs_to :repository, Repository

    timestamps()
  end

  def for_user(query \\ __MODULE__, user_id) do
    from(c in query, where: c.user_id == ^user_id)
  end

  def for_repository(query \\ __MODULE__, repository_id) do
    from(c in query, where: c.repository_id == ^repository_id)
  end

  @valid ~w(user_id repository_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:repository_id)
    |> foreign_key_constraint(:user_id)
    |> unique_constraint(:repository_id, name: index_name(:contributers, [:repository_id, :user_id]))
  end
end
