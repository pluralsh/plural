defmodule Core.Schema.OIDCProviderBinding do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User, Group, OIDCProvider}

  schema "oidc_provider_bindings" do
    belongs_to :user,  User
    belongs_to :group, Group
    belongs_to :provider, OIDCProvider

    timestamps()
  end

  @valid ~w(user_id group_id provider_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:group_id)
    |> foreign_key_constraint(:provider_id)
  end
end
