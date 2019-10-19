defmodule Core.Schema.User do
  use Piazza.Ecto.Schema, derive_json: false

  @email_re ~r/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-\.]+\.[a-zA-Z]{2,}$/

  schema "users" do
    field :name,  :string
    field :email, :string
    field :password_hash, :string
    field :password, :string, virtual: true
    field :jwt, :string, virtual: true

    timestamps()
  end

  defimpl Jason.Encoder, for: __MODULE__ do
    @ignore ~w(password password_hash jwt)a

    def encode(struct, opts) do
      Piazza.Ecto.Schema.mapify(struct)
      |> Map.drop(@ignore)
      |> Jason.Encode.map(opts)
    end
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(p in query, order_by: ^order)

  @valid ~w(name email password)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:email)
    |> validate_required([:name, :email])
    |> validate_length(:email,    max: 255)
    |> validate_length(:name,     max: 255)
    |> validate_length(:password, min: 10)
    |> validate_format(:email, @email_re)
    |> hash_password()
    |> validate_required([:password_hash])
  end

  defp hash_password(%Ecto.Changeset{valid?: true, changes: %{password: password}} = changeset) do
    change(changeset, Argon2.add_hash(password))
  end
  defp hash_password(changeset), do: changeset
end