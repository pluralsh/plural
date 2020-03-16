defmodule Watchman.Schema.Invite do
  use Piazza.Ecto.Schema

  schema "watchman_invites" do
    field :secure_id, :string
    field :email,     :string

    timestamps()
  end

  def expired(query \\ __MODULE__) do
    expired = DateTime.utc_now() |> Timex.shift(days: -7)
    from(i in query, where: i.inserted_at < ^expired)
  end

  @valid ~w(email)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> put_new_change(:secure_id, &gen_external_id/0)
    |> unique_constraint(:secure_id)
    |> validate_required([:email])
  end

  defp gen_external_id() do
    :crypto.strong_rand_bytes(32)
    |> Base.url_encode64()
    |> String.replace("/", "")
  end
end