defmodule Core.Schema.Artifact do
  use Piazza.Ecto.Schema
  use Arc.Ecto.Schema
  alias Core.Schema.{Repository}

  defenum Platform, mac: 0, windows: 1, linux: 2
  defenum Type, cli: 0, mobile: 1, desktop: 2

  schema "artifacts" do
    field :name,      :string
    field :readme,    :binary
    field :blob,      Core.Storage.Type
    field :blob_id,   :binary_id
    field :platform,  Platform
    field :type,      Type
    field :filesize,  :integer
    field :sha,       :string

    belongs_to :repository, Repository

    timestamps()
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(a in query, order_by: ^order)

  @valid ~w(name readme platform type)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> generate_uuid(:blob_id)
    |> validate_required([:name, :platform, :type])
    |> foreign_key_constraint(:repository_id)
    |> cast_attachments(attrs, [:blob], allow_urls: true)
    |> add_sha(attrs)
    |> add_filesize(attrs)
  end


  def add_sha(changeset, %{blob: %{path: path}}) do
    put_change(changeset, :sha, Piazza.File.hash(path))
  end
  def add_sha(changeset, _), do: changeset

  def add_filesize(changeset, %{blob: %{path: path}}) do
    case File.stat(path) do
      {:ok, %{size: size}} -> put_change(changeset, :filesize, size)
      _ -> changeset
    end
  end
  def add_filesize(changeset, _), do: changeset
end