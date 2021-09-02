defmodule Core.Schema.DnsAccessPolicyBinding do
  use Piazza.Ecto.Schema
  alias Core.Schema.{DnsAccessPolicy, User, Group}

  schema "dns_policy_bindings" do
    belongs_to :policy, DnsAccessPolicy
    belongs_to :user,   User
    belongs_to :group,  Group

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
