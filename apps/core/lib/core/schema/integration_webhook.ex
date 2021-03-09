defmodule Core.Schema.IntegrationWebhook do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Account}

  schema "integration_webhooks" do
    field :name,    :string
    field :url,     Piazza.Ecto.Types.URI
    field :actions, {:array, :string}
    field :secret,  :string

    belongs_to :account, Account

    timestamps()
  end

  def for_account(query \\ __MODULE__, account_id) do
    from(iw in query, where: iw.account_id == ^account_id)
  end

  def for_accounts(query \\ __MODULE__, account_ids) do
    from(iw in query, where: iw.account_id in ^account_ids)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]) do
    from(iw in query, order_by: ^order)
  end

  def search(query \\ __MODULE__, search) do
    from(iw in query, where: ilike(iw.name, ^"#{search}%"))
  end

  @valid ~w(name url actions account_id)a

  @actions ~w(incident.create incident.update incident.message.create incident.message.delete)

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:account_id)
    |> validate_subset(:actions, @actions)
    |> put_new_change(:secret, &gen_token/0)
    |> validate_required([:name, :url, :actions])
  end

  defp gen_token() do
    "wh-" <>
    (:crypto.strong_rand_bytes(64)
    |> Base.url_encode64())
  end
end
