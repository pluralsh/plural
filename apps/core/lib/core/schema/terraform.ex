defmodule Core.Schema.Terraform do
  use Piazza.Ecto.Schema
  use Arc.Ecto.Schema
  alias Core.Schema.Repository


  schema "terraform" do
    field :name, :string
    field :package_id, :binary_id
    field :package, Core.Storage.Type
    field :values_template, :string
    field :readme, :string

    belongs_to :repository, Repository

    timestamps()
  end

  @valid ~w(name values_template readme)a

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> generate_uuid(:package_id)
    |> unique_constraint(:name, name: index_name(:terraform, [:repository_id, :name]))
    |> foreign_key_constraint(:repository_id)
    |> cast_attachments(attrs, [:package], allow_urls: true)
    |> validate_required([:name, :repository_id])
  end
end