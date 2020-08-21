defmodule Core.Schema.VersionTag do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Version, Chart}

  schema "version_tags" do
    field :tag, :string

    belongs_to :version, Version
    belongs_to :chart, Chart

    timestamps()
  end

  @valid ~w(tag version_id chart_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:version_id)
    |> foreign_key_constraint(:chart_id)
    |> unique_constraint(:version_id, name: index_name(:version_tags, [:version_id, :tag]))
    |> validate_required([:tag])
  end
end