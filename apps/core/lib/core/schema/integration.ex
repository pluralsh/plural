defmodule Core.Schema.Integration do
  use Piazza.Ecto.Schema
  use Arc.Ecto.Schema

  alias Core.Schema.{Publisher, Repository, ResourceDefinition, Tag}

  schema "integrations" do
    field :name,          :string
    field :icon,          Core.Storage.Type
    field :icon_id,       :binary_id
    field :source_url,    :string
    field :description,   :string
    field :type,          :string
    field :spec,          :map

    belongs_to :publisher,  Publisher
    belongs_to :repository, Repository

    has_many :tags, Tag,
      where: [resource_type: :integration],
      foreign_key: :resource_id,
      on_replace: :delete

    timestamps()
  end

  def for_repository(query \\ __MODULE__, repo_id),
    do: from(i in query, where: i.repository_id == ^repo_id)

  def for_tag(query \\ __MODULE__, tag) do
    from(i in query,
      join: t in assoc(i, :tags),
      where: t.tag == ^tag
    )
  end

  def for_type(query \\ __MODULE__, type) do
    from(i in query, where: i.type == ^type)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(i in query, order_by: ^order)

  @valid ~w(name source_url description spec publisher_id type)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_assoc(:tags, with: &Tag.tag_changeset(&1, &2, :integration))
    |> foreign_key_constraint(:publisher_id)
    |> foreign_key_constraint(:repository_id)
    |> unique_constraint(:name, name: index_name(:integrations, [:repository_id, :name]))
    |> generate_uuid(:icon_id)
    |> cast_attachments(attrs, [:icon])
    |> validate_required([:name, :spec])
  end

  def validate(changeset, %ResourceDefinition{} = resource) do
    validate_change(changeset, :spec, fn :spec, val ->
      case ResourceDefinition.validate(resource, val) do
        :ok -> []
        {:error, errors} -> [spec: "Invalid specification: #{Enum.join(errors, ", ")}"]
      end
    end)
  end
  def validate(changeset, _), do: add_error(changeset, :spec, "No resource definition present for this repository")
end
