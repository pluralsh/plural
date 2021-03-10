defmodule Core.Schema.OAuthIntegration do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Account}

  defenum Service, zoom: 0

  schema "oauth_integrations" do
    field :service,        Service
    field :access_token,   :string
    field :refresh_token,  :string
    field :expires_at,     :utc_datetime_usec

    belongs_to :account, Account

    timestamps()
  end

  def for_account(query \\ __MODULE__, account_id) do
    from(oa in query, where: oa.account_id == ^account_id)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :service]) do
    from(oa in query, order_by: ^order)
  end

  @valid ~w(service access_token refresh_token expires_at)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:account_id)
    |> unique_constraint(:service, name: index_name(:oauth_integrations, [:account_id, :service]))
    |> validate_required([:service])
  end
end
