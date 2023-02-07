defmodule Core.Schema.Version do
  use Piazza.Ecto.Schema
  use Waffle.Ecto.Schema
  alias Core.Schema.{
    Chart,
    Dependencies,
    VersionTag,
    Crd,
    Terraform,
    ImageDependency,
    PackageScan
  }

  defenum TemplateType, gotemplate: 0, lua: 1, javascript: 2

  schema "versions" do
    field :version,         :string
    field :helm,            :map
    field :readme,          :string
    field :package,         Core.Storage.Type
    field :package_id,      :binary_id
    field :values_template, :string
    field :digest,          :string
    field :template_type,   TemplateType, default: 0
    field :inserted,        :boolean, virtual: true

    embeds_one :dependencies, Dependencies, on_replace: :update

    has_many :tags,        VersionTag, on_replace: :delete
    has_many :crds,        Crd
    has_many :image_dependencies, ImageDependency

    belongs_to :chart,     Chart
    belongs_to :terraform, Terraform
    has_one :scan,         PackageScan

    timestamps()
  end

  def for_terraform(query \\ __MODULE__, terraform_id),
    do: from(v in query, where: v.terraform_id == ^terraform_id)

  def for_chart(query \\ __MODULE__, chart_id),
    do: from(v in query, where: v.chart_id == ^chart_id)

  def ordered(query \\ __MODULE__, order \\ [desc: :inserted_at]),
    do: from(v in query, order_by: ^order)

  def preloaded(query \\ __MODULE__, preloads \\ [:terraform, [chart: :repository]]) do
    from(v in query, preload: ^preloads)
  end

  @valid ~w(version chart_id readme values_template template_type)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:dependencies)
    |> cast_assoc(:tags)
    |> validate_required([:version])
    |> generate_uuid(:package_id)
    |> cast_attachments(attrs, [:package], allow_urls: true)
    |> unique_constraint(:chart_id, name: index_name(:versions, [:chart_id, :version]))
    |> unique_constraint(:terraform_id, name: index_name(:versions, [:terraform_id, :version]))
    |> foreign_key_constraint(:chart_id)
    |> foreign_key_constraint(:terraform_id)
  end

  def helm_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, [:helm, :digest | @valid])
    |> cast_embed(:dependencies)
  end
end
