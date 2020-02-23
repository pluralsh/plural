defmodule Core.Schema.Publisher do
  use Piazza.Ecto.Schema
  use Arc.Ecto.Schema
  alias Core.Schema.{User, Address}

  schema "publishers" do
    field :name,        :string
    field :avatar_id,   :binary_id
    field :avatar,      Core.Storage.Type
    field :description, :string
    field :account_id,  :string
    field :phone,       :string

    embeds_one :address, Address
    belongs_to :owner, User

    timestamps()
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(p in query, order_by: ^order)

  @valid ~w(name owner_id description phone)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:address)
    |> validate_required([:name, :owner_id])
    |> foreign_key_constraint(:owner_id)
    |> unique_constraint(:name)
    |> validate_length(:name, max: 255)
    |> generate_uuid(:avatar_id)
    |> cast_attachments(attrs, [:avatar], allow_urls: true)
  end

  @stripe_valid ~w(account_id)a

  def stripe_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @stripe_valid)
    |> unique_constraint(:account_id)
  end
end