defmodule Core.Schema.Crd do
  use Piazza.Ecto.Schema
  use Waffle.Ecto.Schema
  alias Core.Schema.Version

  schema "crds" do
    field :name, :string
    field :blob, Core.Storage.Type
    field :blob_id, :binary_id

    belongs_to :version, Version

    timestamps()
  end

  @valid ~w(name)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> generate_uuid(:blob_id)
    |> foreign_key_constraint(:version_id)
    |> unique_constraint(:name, name: index_name(:crds, [:version_id, :name]))
    |> cast_attachments(attrs, [:blob], allow_urls: true)
    |> validate_required([:name, :version_id])
  end
end
