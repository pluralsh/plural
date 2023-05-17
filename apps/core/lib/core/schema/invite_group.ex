defmodule Core.Schema.InviteGroup do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Invite, Group}

  schema "invite_groups" do
    belongs_to :invite, Invite
    belongs_to :group, Group

    timestamps()
  end

  @valid ~w(group_id invite_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:group_id)
    |> foreign_key_constraint(:invite_id)
    |> unique_constraint(:invite_id, name: index_name(:invite_groups, [:invite_id, :user_id]))
    |> validate_required([:group_id])
  end
end
