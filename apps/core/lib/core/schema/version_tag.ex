defmodule Core.Schema.VersionTag do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Version, Chart, Terraform}

  schema "version_tags" do
    field :tag, :string

    belongs_to :version, Version
    belongs_to :chart, Chart
    belongs_to :terraform, Terraform

    timestamps()
  end

  def for_chart(query \\ __MODULE__, chart_id) do
    from(v in query, where: v.chart_id == ^chart_id)
  end

  def for_terraform(query \\ __MODULE__, tf_id) do
    from(v in query, where: v.terraform_id == ^tf_id)
  end

  def for_tags(query \\ __MODULE__, tags) do
    from(v in query, where: v.tag in ^tags)
  end

  def ignore_version(query \\ __MODULE__, version_id) do
    from(v in query, where: v.version_id != ^version_id)
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