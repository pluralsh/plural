defmodule Core.Schema.OIDCLogin do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User, OIDCProvider, Account}

  schema "oidc_logins" do
    belongs_to :account,  Account
    belongs_to :user,     User
    belongs_to :provider, OIDCProvider
    has_one    :repository, through: [:provider, :installation, :repository]

    timestamps()
  end

  def for_account(query \\ __MODULE__, account_id) do
    from(n in query, where: n.account_id == ^account_id)
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]) do
    from(n in query, order_by: ^order)
  end

  @valid ~w(user_id provider_id account_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:account_id)
    |> foreign_key_constraint(:provider_id)
    |> validate_required([:user_id, :provider_id])
  end
end
