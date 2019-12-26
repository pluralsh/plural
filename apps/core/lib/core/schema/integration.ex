defmodule Core.Schema.Integration do
  use Piazza.Ecto.Schema
  use Arc.Ecto.Schema

  alias Core.Schema.{Publisher, Repository, ResourceDefinition}

  schema "integrations" do
    field :name,          :string
    field :icon,          Core.Storage.Type
    field :icon_id,       :binary_id
    field :source_url,    :string
    field :description,   :string
    field :spec,          :map

    belongs_to :publisher,  Publisher
    belongs_to :repository, Repository

    timestamps()
  end

  def for_repository(query \\ __MODULE__, repo_id),
    do: from(i in query, where: i.repository_id == ^repo_id)

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(i in query, order_by: ^order)

  @valid ~w(name source_url description spec)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:publisher_id)
    |> foreign_key_constraint(:repository_id)
    |> unique_constraint(:name, name: index_name(:integrations, [:repository_id, :name]))
    |> generate_uuid(:icon_id)
    |> cast_attachments(attrs, [:icon], allow_urls: true)
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