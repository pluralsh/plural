defmodule Core.Schema.OIDCLogin do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User, OIDCProvider, Account}

  schema "oidc_logins" do
    field :ip,        :string
    field :country,   :string
    field :city,      :string
    field :latitude,  :string
    field :longitude, :string

    belongs_to :account,  Account
    belongs_to :user,     User
    belongs_to :provider, OIDCProvider
    has_one    :repository, through: [:provider, :installation, :repository]
    has_one    :owner,      through: [:provider, :installation, :user]

    timestamps()
  end

  def for_account(query \\ __MODULE__, account_id) do
    from(l in query, where: l.account_id == ^account_id)
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]) do
    from(l in query, order_by: ^order)
  end

  def created_after(query \\ __MODULE__, dt) do
    from(l in query, where: l.inserted_at >= ^dt)
  end

  def aggregate(query \\ __MODULE__) do
    from(l in query,
      where: not is_nil(l.country),
      group_by: l.country,
      select: %{country: l.country, count: count(l.id)}
    )
  end

  @valid ~w(user_id provider_id account_id ip country city latitude longitude)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:account_id)
    |> foreign_key_constraint(:provider_id)
    |> validate_required([:user_id, :provider_id])
  end
end
