defmodule Core.Schema.File do
  use Piazza.Ecto.Schema
  use Arc.Ecto.Schema

  alias Core.Schema.IncidentMessage

  defenum MediaType, image: 0, video: 1, audio: 2, other: 3, pdf: 4

  schema "files" do
    field :blob_id,      :binary_id
    field :blob,         Core.Storage.Type
    field :media_type,   MediaType
    field :filename,     :string
    field :filesize,     :integer
    field :content_type, :string

    belongs_to :message, IncidentMessage

    timestamps()
  end

  def for_incident(query \\ __MODULE__, incident_id) do
    from(f in query,
      join: m in assoc(f, :message),
      where: m.incident_id == ^incident_id
    )
  end

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]) do
    from(f in query, order_by: ^order)
  end

  @valid ~w(message_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> generate_uuid(:blob_id)
    |> cast_attachments(attrs, [:blob], allow_urls: true)
    |> foreign_key_constraint(:message_id)
    |> put_change(:filename, get_upload(attrs) |> filename())
    |> put_change(:filesize, get_upload(attrs) |> file_size())
    |> add_media_type()
    |> validate_required([:object, :filename, :media_type])
  end

  def get_upload(%{blob: blob}), do: blob
  def get_upload(%{"blob" => blob}), do: blob
  def get_upload(_), do: nil

  def filename(%Plug.Upload{filename: name}), do: name
  def filename(url) when is_binary(url), do: Path.basename(url)
  def filename(_), do: nil

  def media_type(name) do
    MIME.from_path(name)
    |> String.split("/")
    |> infer_media_type()
  end

  defp add_media_type(changeset) do
    case apply_changes(changeset) do
      %{filename: name} -> change(changeset, %{media_type: media_type(name), content_type: MIME.from_path(name)})
      _ -> changeset
    end
  end

  defp infer_media_type(["image", "svg" <> _]), do: :other
  defp infer_media_type(["image", _]),  do: :image
  defp infer_media_type(["video", _]), do: :video
  defp infer_media_type([_, "pdf"]), do: :pdf
  defp infer_media_type(_), do: :other

  def file_size(%Plug.Upload{path: path}) do
    case File.stat(path) do
      {:ok, %{size: size}} -> size
      _ -> nil
    end
  end
  def file_size(_), do: nil
end
