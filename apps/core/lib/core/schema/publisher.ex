defmodule Core.Schema.Publisher do
  use Piazza.Ecto.Schema
  use Arc.Ecto.Schema
  alias Core.Schema.User

  schema "publishers" do
    field :name, :string
    field :avatar_id, :binary_id
    field :avatar, Core.Storage.Type
    field :description, :string

    belongs_to :owner, User

    timestamps()
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(p in query, order_by: ^order)

  @valid ~w(name owner_id avatar description)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:name, :owner_id])
    |> foreign_key_constraint(:owner_id)
    |> unique_constraint(:name)
    |> validate_length(:name, max: 255)
    |> generate_uuid(:avatar_id)
    |> cast_attachments(attrs, [:avatar], allow_urls: true)
  end
end