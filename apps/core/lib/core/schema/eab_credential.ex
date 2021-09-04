defmodule Core.Schema.EabCredential do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User, Recipe.Provider}

  schema "eab_credentials" do
    field :key_id,   :string
    field :hmac_key, :string
    field :cluster,  :string
    field :provider, Provider

    belongs_to :user, User

    timestamps()
  end

  def for_user(query \\ __MODULE__, user_id) do
    from(c in query, where: c.user_id == ^user_id)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :cluster]) do
    from(c in query, order_by: ^order)
  end

  @valid ~w(key_id hmac_key cluster provider user_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required(@valid)
    |> foreign_key_constraint(:user_id)
    |> unique_constraint(:cluster, name: index_name(:eab_credentials, [:user_id, :cluster, :provider]))
  end
end
