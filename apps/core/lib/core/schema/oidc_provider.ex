defmodule Core.Schema.OIDCProvider do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Installation, OIDCProviderBinding}

  schema "oidc_providers" do
    field :client_id,     :string
    field :client_secret, :string
    field :redirect_uris, {:array, :string}
    belongs_to :installation, Installation

    has_many :bindings, OIDCProviderBinding,
      on_replace: :delete,
      foreign_key: :provider_id

    timestamps()
  end

  @valid ~w(client_id client_secret installation_id redirect_uris)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_assoc(:bindings)
    |> unique_constraint(:installation_id)
    |> unique_constraint(:client_id)
    |> foreign_key_constraint(:installation_id)
  end
end
