defmodule Core.Schema.PackageScan do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Version, ScanError, ScanViolation}

  schema "package_scans" do
    field :grade, Core.Schema.DockerImage.Grade

    belongs_to :version, Version
    has_many :errors, ScanError, foreign_key: :scan_id, on_replace: :delete
    has_many :violations, ScanViolation, foreign_key: :scan_id, on_replace: :delete

    timestamps()
  end

  @valid ~w(grade)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_assoc(:errors)
    |> cast_assoc(:violations)
    |> unique_constraint(:version_id)
    |> foreign_key_constraint(:version_id)
    |> validate_required([:version_id])
  end
end
