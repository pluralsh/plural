defmodule Core.Schema.WebhookLog do
  use Piazza.Ecto.Schema
  alias Core.Schema.IntegrationWebhook

  defenum State, sending: 0, delivered: 1, failed: 2

  schema "webhook_logs" do
    field :state,    State
    field :status,   :integer
    field :response, :binary
    field :attempts, :integer

    belongs_to :webhook, IntegrationWebhook

    timestamps()
  end

  def for_webhook(query \\ __MODULE__, webhook_id) do
    from(wl in query, where: wl.webhook_id == ^webhook_id)
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]) do
    from(ql in query, order_by: ^order)
  end

  @valid ~w(state status response webhook_id attempts)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:webhook_id)
    |> validate_required([:state, :attempts])
  end
end
