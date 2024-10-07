defmodule Core.Schema.OIDCProvider do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Installation, OIDCProviderBinding, Invite, User}

  defenum AuthMethod, post: 0, basic: 1

  schema "oidc_providers" do
    field :name,              :string
    field :description,       :string
    field :client_id,         :string
    field :client_secret,     :string
    field :redirect_uris,     {:array, :string}
    field :auth_method,       AuthMethod

    field :consent,           :map, virtual: true
    field :login,             :map, virtual: true

    belongs_to :installation, Installation
    belongs_to :owner,        User

    has_many :invites, Invite, foreign_key: :oidc_provider_id
    has_many :bindings, OIDCProviderBinding,
      on_replace: :delete,
      foreign_key: :provider_id

    timestamps()
  end

  def for_owner(query \\ __MODULE__, owner_id) do
    from(p in query, where: p.owner_id == ^owner_id)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]) do
    from(p in query, order_by: ^order)
  end

  @valid ~w(name description client_id client_secret owner_id installation_id redirect_uris auth_method)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_assoc(:bindings)
    |> unique_constraint(:installation_id)
    |> unique_constraint(:client_id)
    |> foreign_key_constraint(:installation_id)
    |> foreign_key_constraint(:owner_id)
  end
end
