defmodule Core.Schema.OIDCLogin do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User, OIDCProvider}

  schema "oidc_logins" do
    belongs_to :user, User
    belongs_to :provider, OIDCProvider

    timestamps()
  end

  @valid ~w(user_id provider_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:provider_id)
    |> validate_required([:user_id, :provider_id])
  end
end
