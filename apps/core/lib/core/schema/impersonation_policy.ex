defmodule Core.Schema.ImpersonationPolicy do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User, ImpersonationPolicyBinding}

  schema "impersonation_policies" do
    belongs_to :user, User

    has_many :bindings, ImpersonationPolicyBinding,
      on_replace: :delete,
      foreign_key: :policy_id

    timestamps()
  end

  @valid ~w(user_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_assoc(:bindings)
    |> unique_constraint(:user_id)
    |> foreign_key_constraint(:user_id)
  end
end
