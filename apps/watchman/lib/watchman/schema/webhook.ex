defmodule Watchman.Schema.Webhook do
  use Piazza.Ecto.Schema

  defenum Type, piazza: 0
  defenum Status, healthy: 0, unhealthy: 1

  schema "watchman_webhooks" do
    field :url,    :string
    field :type,   Type
    field :health, Status

    timestamps()
  end

  @valid ~w(url type health)a

  def ordered(query \\ __MODULE__, order \\ [asc: :id]) do
    from(wh in query, order_by: ^order)
  end

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:url)
    |> validate_required([:url, :type, :health])
  end
end