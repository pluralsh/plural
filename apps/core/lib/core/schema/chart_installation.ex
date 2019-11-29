defmodule Core.Schema.ChartInstallation do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Chart, Installation, Version}

  schema "chart_installations" do
    belongs_to :installation, Installation
    belongs_to :chart,        Chart
    belongs_to :version,      Version

    timestamps()
  end

  def with_auto_upgrade(query \\ __MODULE__) do
    from(ci in query,
      join: inst in assoc(ci, :installation),
      where: inst.auto_upgrade)
  end

  def ignore_version(query \\ __MODULE__, version_id) do
    from(ci in query,
      where: ci.version_id != ^version_id)
  end

  def for_chart(query \\ __MODULE__, chart_id) do
    from(ci in query,
      join: c in assoc(ci, :chart), as: :chart,
      where: c.id == ^chart_id)
  end

  def for_repo(query \\ __MODULE__, repo_id) do
    from(ci in query,
      join: c in assoc(ci, :chart), as: :chart,
      where: c.repository_id == ^repo_id)
  end

  def for_repo_name(query \\ __MODULE__, name) do
    from(ci in query,
      join: c in assoc(ci, :chart), as: :chart,
      join: r in assoc(c, :repository), as: :repo,
      where: r.name == ^name)
  end

  def for_chart_name(query \\ __MODULE__, name) do
    from([ci, chart: c] in query,
      where: c.name == ^name)
  end

  def for_user(query, user_id) do
    from([ci, chart: c] in query,
      join: inst in Installation,
        on: inst.id == ci.installation_id and c.repository_id == inst.repository_id,
      where: inst.user_id == ^user_id
    )
  end

  @valid ~w(installation_id chart_id version_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:installation_id, :chart_id, :version_id])
    |> foreign_key_constraint(:installation_id)
    |> foreign_key_constraint(:chart_id)
    |> foreign_key_constraint(:version_id)
    |> unique_constraint(:version_id, name: index_name(:chart_installations, [:installation_id, :chart_id]))
  end
end