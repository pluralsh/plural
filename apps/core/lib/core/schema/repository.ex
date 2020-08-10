defmodule Core.Schema.Repository do
  use Piazza.Ecto.Schema
  use Arc.Ecto.Schema
  alias Core.Schema.{
    Publisher,
    Dashboard,
    Installation,
    ResourceDefinition,
    Tag,
    Plan,
    Artifact,
    Database,
    Shell
  }

  schema "repositories" do
    field :name,          :string, null: false
    field :icon_id,       :binary_id
    field :icon,          Core.Storage.Type
    field :description,   :string
    field :documentation, :binary
    field :public_key,    Piazza.Ecto.EncryptedString
    field :private_key,   Piazza.Ecto.EncryptedString
    field :secrets,       :map

    belongs_to :integration_resource_definition, ResourceDefinition, on_replace: :update
    belongs_to :publisher, Publisher

    has_one  :database,      Database, on_replace: :update
    has_one  :shell,         Shell, on_replace: :update
    has_many :installations, Installation
    has_many :plans,         Plan
    has_many :artifacts,     Artifact
    has_many :dashboards,    Dashboard, on_replace: :delete
    has_many :tags,          Tag,
        where: [resource_type: :repository],
        foreign_key: :resource_id,
        on_replace: :delete

    timestamps()
  end

  def search(query \\ __MODULE__, sq),
    do: from(r in query, where: like(r.name, ^"#{sq}%"))

  def for_user(query \\ __MODULE__, user_id) do
    from(r in query,
      join: i in ^Installation.for_user(user_id),
        on: i.repository_id == r.id)
  end

  def for_tag(query \\ __MODULE__, tag) do
    from(r in query,
      join: t in assoc(r, :tags),
      where: t.tag == ^tag)
  end

  def for_publisher(query \\ __MODULE__, publisher_id),
    do: from(r in query, where: r.publisher_id == ^publisher_id)

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(r in query, order_by: ^order)

  @valid ~w(name publisher_id description documentation secrets)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_assoc(:tags, with: &Tag.tag_changeset(&1, &2, :repository))
    |> cast_assoc(:dashboards)
    |> cast_assoc(:database)
    |> cast_assoc(:shell)
    |> foreign_key_constraint(:publisher_id)
    |> cast_assoc(:integration_resource_definition)
    |> unique_constraint(:name)
    |> validate_required([:name])
    |> generate_uuid(:icon_id)
    |> cast_attachments(attrs, [:icon], allow_urls: true)
  end

  @keyvalid ~w(public_key private_key)a

  def key_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @keyvalid)
    |> validate_required([:public_key, :private_key])
  end
end