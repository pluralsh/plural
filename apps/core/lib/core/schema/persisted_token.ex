defmodule Core.Schema.PersistedToken do
  use Piazza.Ecto.Schema
  alias Core.Schema.User

  schema "persisted_tokens" do
    field :token, :string

    belongs_to :user, User

    timestamps()
  end

  def for_user(query \\ __MODULE__, user_id) do
    from(t in query,
      where: t.user_id == ^user_id)
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]) do
    from(t in query,
      order_by: ^order)
  end

  @valid ~w(user_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> put_new_change(:token, &gen_token/0)
    |> validate_required([:token, :user_id])
    |> foreign_key_constraint(:user_id)
    |> unique_constraint(:token)
  end

  def gen_token() do
    "cmt-" <>
    (:crypto.strong_rand_bytes(64)
    |> Base.url_encode64())
  end
end
