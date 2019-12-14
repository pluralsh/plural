defmodule Core.Schema.Webhook do
  use Piazza.Ecto.Schema
  alias Core.Schema.User

  schema "webhooks" do
    field :url,    :string
    field :secret, :string

    belongs_to :user, User

    timestamps()
  end

  def for_user(query \\ __MODULE__, user_id),
    do: from(w in query, where: w.user_id == ^user_id)

  def ordered(query \\ __MODULE__, order \\ [asc: :url]),
    do: from(w in query, order_by: ^order)

  @valid ~w(url user_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:url, name: index_name(:webhooks, [:user_id, :url]))
    |> foreign_key_constraint(:user_id)
    |> put_new_change(:secret, &gen_token/0)
    |> validate_required([:user_id, :url, :secret])
  end

  defp gen_token() do
    "wh-" <>
    (:crypto.strong_rand_bytes(64)
    |> Base.url_encode64())
  end
end