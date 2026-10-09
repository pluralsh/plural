defmodule Core.Schema.RefreshToken do
  use Piazza.Ecto.Schema
  alias Core.Schema.User

  schema "refresh_tokens" do
    field :token, :string
    field :expires_at, :utc_datetime_usec

    belongs_to :user, User

    timestamps()
  end

  def expired(query \\ __MODULE__) do
    expiry = Timex.now() |> Timex.subtract(expiry())
    from(rt in query, where: rt.inserted_at <= ^expiry or (not is_nil(rt.expires_at) and rt.expires_at <= ^Timex.now()))
  end

  def expired?(%__MODULE__{expires_at: %DateTime{} = at}), do: Timex.before?(at, Timex.now())
  def expired?(_), do: false

  def replacement_expiry(), do: Timex.now() |> Timex.shift(hours: 2)

  def retire(%__MODULE__{} = model) do
    model
    |> cast(%{}, [])
    |> put_new_change(:expires_at, &replacement_expiry/0)
  end

  def for_user(query \\ __MODULE__, user_id) do
    from(rt in query, where: rt.user_id == ^user_id)
  end

  @valid ~w(user_id expires_at)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> put_new_change(:token, fn -> Core.random_alphanum(32) end)
    |> foreign_key_constraint(:user_id)
    |> validate_required(~w(token user_id)a)
  end

  defp expiry() do
    case Core.conf(:refresh_token_expiry) do
      %Timex.Duration{} = d -> d
      days when is_integer(days) -> Timex.Duration.from_days(days)
      _ -> Timex.Duration.from_days(7)
    end
  end
end
