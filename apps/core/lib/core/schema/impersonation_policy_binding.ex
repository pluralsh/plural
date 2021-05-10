defmodule Core.Schema.ImpersonationPolicyBinding do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User, Group, ImpersonationPolicy}

  schema "impersonation_policy_bindings" do
    belongs_to :user, User
    belongs_to :group, Group
    belongs_to :policy, ImpersonationPolicy

    timestamps()
  end

  @valid ~w(user_id group_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:group_id)
    |> foreign_key_constraint(:policy_id)
  end
end
