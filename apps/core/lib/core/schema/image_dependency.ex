defmodule Core.Schema.ImageDependency do
  use Piazza.Ecto.Schema
  alias Core.Schema.{DockerImage, Version}

  schema "image_dependencies" do
    belongs_to :image,   DockerImage
    belongs_to :version, Version

    timestamps()
  end

  @valid ~w(image_id version_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:image_id)
    |> foreign_key_constraint(:version_id)
    |> validate_required([:version_id, :image_id])
  end
end
