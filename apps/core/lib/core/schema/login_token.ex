defmodule Core.Schema.LoginToken do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User}

  schema "login_tokens" do
    field :token,  :string
    field :active, :boolean, default: false

    belongs_to :user, User

    timestamps()
  end

  def older_than(query \\ __MODULE__, days) do
    prior = Timex.now() |> Timex.shift(days: -days)
    from(l in query, where: l.inserted_at < ^prior)
  end

  @valid ~w(user_id active)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> put_new_change(:token, &gen_token/0)
    |> validate_required([:token, :user_id])
    |> foreign_key_constraint(:user_id)
    |> unique_constraint(:token)
  end

  def gen_token() do
    "lt-" <>
    (:crypto.strong_rand_bytes(64)
    |> Base.url_encode64())
  end
end
