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
    Shell,
    User
  }

  defenum Category,
    devops: 0,
    database: 1,
    messaging: 2,
    security: 3,
    data: 4,
    productivity: 5,
    network: 6,
    storage: 7

  schema "repositories" do
    field :name,          :string, null: false
    field :icon_id,       :binary_id
    field :icon,          Core.Storage.Type
    field :description,   :string
    field :documentation, :binary
    field :public_key,    Piazza.Ecto.EncryptedString
    field :private_key,   Piazza.Ecto.EncryptedString
    field :secrets,       :map
    field :private,       :boolean, default: false
    field :category,      Category

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

  def for_category(query \\ __MODULE__, category) do
    from(r in query, where: r.category == ^category)
  end

  def categories(query \\ __MODULE__) do
    from(r in query,
      group_by: r.category,
      select: %{category: r.category, count: count(r.id)},
      order_by: [asc: r.category]
    )
  end

  def search(query \\ __MODULE__, sq),
    do: from(r in query, where: like(r.name, ^"#{sq}%"))

  def supported(query \\ __MODULE__, user)
  def supported(query, %User{id: id, account: %{root_user_id: id}}), do: query
  def supported(query, %User{} = user) do
    subquery =
      user
      |> User.roles()
      |> Enum.filter(& &1.permissions.support)
      |> Enum.reduce(dynamic([r], r.name == "~~never-used~~"), fn %{repositories: repos}, acc ->
        Enum.reduce(repos, acc, fn repo, q ->
          like = String.replace(repo, "*", "%")
          dynamic([r], ilike(r.name, ^like) or ^q)
        end)
      end)

    from(r in query, where: ^subquery)
  end

  def for_account(query \\ __MODULE__, account_id) do
    from(r in query,
      join: p in assoc(r, :publisher),
      where: p.account_id == ^account_id
    )
  end

  def for_user(query \\ __MODULE__, user_id) do
    from(r in query,
      join: i in ^Installation.for_user(user_id),
        on: i.repository_id == r.id)
  end

  def accessible(query \\ __MODULE__, %User{account_id: aid}) do
    from(r in query,
      join: p in assoc(r, :publisher),
      where: not r.private or p.account_id == ^aid
    )
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

  @valid ~w(name publisher_id description documentation secrets private category)a

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
