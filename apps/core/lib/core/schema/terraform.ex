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

    embeds_one :dependencies, Dependencies, on_replace: :update
    belongs_to :repository,   Repository

    timestamps()
  end

  def search(query \\ __MODULE__, sq),
    do: from(tf in query, where: like(tf.name, ^"#{sq}%"))

  def for_repository(query \\ __MODULE__, id),
    do: from(tf in query, where: tf.repository_id == ^id)

  def ordered(query \\ __MODULE__, order \\ [asc: :id]),
    do: from(tf in query, order_by: ^order)

  @valid ~w(name values_template readme description)a

  def changeset(schema, attrs \\ %{}) do
    schema
    |> cast(attrs, @valid)
    |> cast_embed(:dependencies)
    |> generate_uuid(:package_id)
    |> unique_constraint(:name, name: index_name(:terraform, [:repository_id, :name]))
    |> foreign_key_constraint(:repository_id)
    |> cast_attachments(attrs, [:package], allow_urls: true)
    |> validate_required([:name, :repository_id])
  end
end