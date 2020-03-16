defmodule Watchman.Schema.User do
  use Piazza.Ecto.Schema

  @email_re ~r/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-\.]+\.[a-zA-Z]{2,}$/

  schema "watchman_users" do
    field :name, :string
    field :email, :string
    field :password_hash, :string
    field :password,      :string, virtual: true
    field :jwt,           :string, virtual: true
    field :deleted_at,    :utc_datetime_usec

    timestamps()
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :email]) do
    from(u in query, order_by: ^order)
  end

  @valid ~w(name email password deleted_at)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:email)
    |> validate_length(:password, min: 10)
    |> validate_length(:email, max: 255)
    |> validate_format(:email, @email_re)
    |> validate_required([:email, :name])
    |> hash_password()
  end

  defp hash_password(%Ecto.Changeset{valid?: true, changes: %{password: password}} = changeset) do
    change(changeset, Argon2.add_hash(password))
  end
  defp hash_password(changeset), do: changeset
end