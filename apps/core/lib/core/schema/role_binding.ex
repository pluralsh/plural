defmodule Core.Schema.RoleBinding do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User, Group, Role}

  schema "role_bindings" do
    belongs_to :user, User
    belongs_to :role, Role
    belongs_to :group, Group

    timestamps()
  end

  @valid ~w(user_id group_id role_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:role_id)
    |> foreign_key_constraint(:group_id)
    |> unique_constraint(:user_id, name: index_name(:role_bindings, [:role_id, :user_id]))
    |> unique_constraint(:group_id, name: index_name(:role_bindings, [:role_id, :group_id]))
  end
end