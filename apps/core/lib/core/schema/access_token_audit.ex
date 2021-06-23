defmodule Core.Schema.AccessTokenAudit do
  use Piazza.Ecto.Schema
  alias Core.Schema.PersistedToken

  schema "access_token_audits" do
    field :ip,        :string
    field :timestamp, :utc_datetime_usec
    field :count,     :integer, default: 0

    belongs_to :token, PersistedToken

    timestamps()
  end

  def for_token(query \\ __MODULE__, token_id) do
    from(t in query, where: t.token_id == ^token_id)
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :timestamp]) do
    from(t in query, order_by: ^order)
  end

  @valid ~w(ip timestamp token_id count)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:token_id)
    |> unique_constraint(:timestamp, name: index_name(:access_token_audits, [:token_id, :ip, :timestamp]))
    |> validate_required([:ip, :timestamp, :token_id])
  end
end
