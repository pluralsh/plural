defmodule Core.Schema.OIDCTrustRelationship do
  use Piazza.Ecto.Schema
  alias Core.Schema.User

  schema "oidc_trust_relationships" do
    field :issuer, :string
    field :trust,  :string
    field :scopes, {:array, :string}

    belongs_to :user, User

    timestamps()
  end

  def allow?(%__MODULE__{trust: trust}, resource) do
    case Regex.compile(trust) do
      {:ok, regex} -> String.match?(resource, regex)
      _ -> false
    end
  end

  def for_user(query \\ __MODULE__, user_id) do
    from(otr in query, where: otr.user_id == ^user_id)
  end

  def for_issuer(query \\ __MODULE__, iss) do
    from(otr in query, where: otr.issuer == ^iss)
  end

  @valid ~w(issuer trust user_id scopes)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:user_id)
    |> validate_required([:issuer, :trust, :user_id])
  end
end
