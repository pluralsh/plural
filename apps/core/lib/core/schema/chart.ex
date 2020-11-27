defmodule Core.Schema.Chart do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Repository, Dependencies, VersionTag, Version}

  schema "charts" do
    field :name,           :string
    field :latest_version, :string
    field :description,    :string

    embeds_one :dependencies, Dependencies, on_replace: :update
    has_many :tags, VersionTag, on_replace: :delete
    has_many :versions, Version
    belongs_to :repository, Repository

    timestamps()
  end

  def search(query \\ __MODULE__, sq),
    do: from(c in query, where: like(c.name, ^"#{sq}%"))

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(c in query, order_by: ^order)

  def for_repository(query \\ __MODULE__, repo_id) do
    from(c in query, where: c.repository_id == ^repo_id)
  end

  def for_repository_name(query \\ __MODULE__, name) do
    from(c in query,
      join: r in assoc(c, :repository),
      where: r.name == ^name)
  end

  def for_name(query \\ __MODULE__, names) when is_list(names),
    do: from(c in query, where: c.name in ^names)

  def preloaded(query \\ __MODULE__, preload \\ [:repository]),
    do: from(c in query, preload: ^preload)

  def preload_versions(query \\ __MODULE__) do
    from(c in query, preload: ^[versions: &version_preloads/1])
  end

  @versions """
  (
    SELECT v.id as id
    FROM versions v
    WHERE v.chart_id = ?
    ORDER BY v.inserted_at desc
    LIMIT 25
  )
  """

  def paginated_versions(query \\ __MODULE__, ids) do
    from(c in query,
      inner_lateral_join: v in fragment(@versions, c.id),
      where: c.id in ^ids,
      select: v.id
    )
  end

  @valid ~w(name latest_version description repository_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:dependencies)
    |> cast_assoc(:tags)
    |> unique_constraint(:name, name: index_name(:charts, [:repository_id, :name]))
    |> bump_version(model)
    |> foreign_key_constraint(:repository_id)
    |> validate_required([:name, :latest_version])
    |> validate_length(:name, max: 255)
  end

  def bump_version(cs, %{latest_version: nil}), do: cs
  def bump_version(cs, %{latest_version: v}) do
    with changed_version when not is_nil(changed_version) <- get_change(cs, :latest_version),
         :lt <- Elixir.Version.compare(changed_version, v) do
      delete_change(cs, :latest_version)
    else
      _ -> cs
    end
  end

  def version_preloads(ids) do
    child_ids =
      paginated_versions(ids)
      |> Core.Repo.all()
      |> Enum.map(&Ecto.UUID.cast!/1)

    Version
    |> for_ids(child_ids)
    |> Core.Repo.all()
  end
end