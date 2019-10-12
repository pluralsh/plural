defmodule Core.Schema.ChartInstallation do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Chart, Installation, Version}

  schema "chart_installations" do
    belongs_to :installation, Installation
    belongs_to :chart, Chart
    belongs_to :version, Version

    timestamps()
  end

  @valid ~w(installation_id chart_id version_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:installation_id)
    |> foreign_key_constraint(:chart_id)
    |> foreign_key_constraint(:version_id)
    |> unique_constraint(:version_id, name: index_name(:chart_installations, [:installation_id, :chart_id]))
  end
end