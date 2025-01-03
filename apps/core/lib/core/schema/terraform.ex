defmodule Core.Schema.Terraform do
  use Piazza.Ecto.Schema
  use Arc.Ecto.Schema
  alias Core.Schema.{Repository, Dependencies}

  schema "terraform" do
    field :name,            :string
    field :package,         Core.Storage.Type
    field :package_id,      :binary_id
    field :description,     :string
    field :values_template, :string
    field :readme,          :string
    field :latest_version,  :string

    embeds_one :dependencies, Dependencies, on_replace: :update
    belongs_to :repository,   Repository

    timestamps()
  end

  def search(query \\ __MODULE__, sq),
    do: from(tf in query, where: like(tf.name, ^"#{sq}%"))

  def for_repository(query \\ __MODULE__, id),
    do: from(tf in query, where: tf.repository_id == ^id)

  def for_repository_name(query \\ __MODULE__, name) do
    from(tf in query,
      join: r in assoc(tf, :repository),
      where: r.name == ^name)
  end

  def for_name(query \\ __MODULE__, names) when is_list(names),
    do: from(tf in query, where: tf.name in ^names)

  def ordered(query \\ __MODULE__, order \\ [asc: :id]),
    do: from(tf in query, order_by: ^order)

  def preloaded(query \\ __MODULE__, preload \\ [:repository]),
    do: from(tf in query, preload: ^preload)

  @valid ~w(name values_template readme description latest_version)a

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> cast_embed(:dependencies)
    |> generate_uuid(:package_id)
    |> unique_constraint(:name, name: index_name(:terraform, [:repository_id, :name]))
    |> foreign_key_constraint(:repository_id)
    |> bump_version(schema)
    |> cast_attachments(attrs, [:package])
    |> validate_required([:name, :repository_id])
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
end
