defmodule Core.Schema.User do
  use Piazza.Ecto.Schema, derive_json: false
  use Arc.Ecto.Schema
  alias Core.Schema.{Address, Publisher, Webhook, Account}

  @email_re ~r/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-\.]+\.[a-zA-Z]{2,}$/

  schema "users" do
    field :name,          :string
    field :email,         :string
    field :password_hash, :string
    field :password,      :string, virtual: true
    field :jwt,           :string, virtual: true
    field :avatar_id,     :binary_id
    field :avatar,        Core.Storage.Type
    field :customer_id,   :string
    field :phone,         :string

    embeds_one :address, Address, on_replace: :update
    belongs_to :account, Account
    has_one :publisher,  Publisher,
      foreign_key: :owner_id
    has_many :webhooks,  Webhook

    timestamps()
  end

  def search(query \\ __MODULE__, name) do
    from(u in query, where: like(u.name, ^"#{name}%") or like(u.email, ^"#{name}%"))
  end

  def for_account(query \\ __MODULE__, account_id) do
    from(u in query, where: u.account_id == ^account_id)
  end

  def without_account(query \\ __MODULE__) do
    from(u in query, where: is_nil(u.account_id))
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(p in query, order_by: ^order)

  @valid ~w(name email password phone)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:address)
    |> unique_constraint(:email)
    |> validate_required([:name, :email])
    |> validate_length(:email,    max: 255)
    |> validate_length(:name,     max: 255)
    |> validate_length(:password, min: 10)
    |> validate_format(:email, @email_re)
    |> hash_password()
    |> generate_uuid(:avatar_id)
    |> cast_attachments(attrs, [:avatar], allow_urls: true)
  end

  @stripe_valid ~w(customer_id)a

  def stripe_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @stripe_valid)
    |> unique_constraint(:customer_id)
  end

  defp hash_password(%Ecto.Changeset{valid?: true, changes: %{password: password}} = changeset) do
    change(changeset, Argon2.add_hash(password))
  end
  defp hash_password(changeset), do: changeset
end

defimpl Jason.Encoder, for: Core.Schema.User do
  @ignore ~w(password password_hash jwt)a

  def encode(struct, opts) do
    Piazza.Ecto.Schema.mapify(struct)
    |> Map.drop(@ignore)
    |> Jason.Encode.map(opts)
  end
end