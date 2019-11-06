defmodule Core.Schema.Repository do
  use Piazza.Ecto.Schema
  use Arc.Ecto.Schema
  alias Core.Schema.{Publisher, Installation}

  schema "repositories" do
    field :name, :string, null: false
    field :icon_id, :binary_id
    field :icon, Core.Storage.Type
    field :description, :string
    field :documentation, :binary

    belongs_to :publisher, Publisher
    has_many :installations, Installation

    timestamps()
  end

  def search(query \\ __MODULE__, sq),
    do: from(r in query, where: like(r.name, ^"#{sq}%"))

  def for_user(query \\ __MODULE__, user_id) do
    from(r in query,
      join: i in ^Installation.for_user(user_id),
        on: i.repository_id == r.id
    )
  end

  def for_publisher(query \\ __MODULE__, publisher_id),
    do: from(r in query, where: r.publisher_id == ^publisher_id)

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(r in query, order_by: ^order)

  @valid ~w(name publisher_id description documentation)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:publisher_id)
    |> unique_constraint(:name)
    |> generate_uuid(:icon_id)
    |> cast_attachments(attrs, [:icon], allow_urls: true)
  end
end