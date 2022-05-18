defmodule Core.Schema.Recipe do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Repository, RecipeSection, RecipeDependency, RecipeTest}

  defenum Provider, gcp: 0, aws: 1, azure: 2, custom: 3, kubernetes: 4, equinix: 5, kind: 6

  defmodule OIDCSettings do
    use Piazza.Ecto.Schema

    embedded_schema do
      field :uri_format,  :string
      field :uri_formats, {:array, :string}
      field :auth_method, Core.Schema.OIDCProvider.AuthMethod
      field :domain_key,  :string
      field :subdomain,   :boolean
    end

    @valid ~w(uri_format auth_method domain_key subdomain uri_formats)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> validate_required([:auth_method])
    end
  end

  schema "recipes" do
    field :name,        :string
    field :description, :string
    field :provider,    Provider
    field :private,     :boolean, default: false
    field :recipe_dependencies, :map, virtual: true

    embeds_one :oidc_settings, OIDCSettings, on_replace: :update
    embeds_many :tests, RecipeTest, on_replace: :delete

    belongs_to :repository, Repository
    has_many :recipe_sections, RecipeSection
    has_many :dependencies, RecipeDependency, on_replace: :delete, foreign_key: :recipe_id

    timestamps()
  end

  def for_repository(query \\ __MODULE__, repo_id),
    do: from(r in query, where: r.repository_id == ^repo_id)

  def for_provider(query \\ __MODULE__, provider),
    do: from(r in query, where: r.provider == ^provider)

  def public(query \\ __MODULE__),
    do: from(r in query, where: not r.private)

  def ordered(query \\ __MODULE__, order \\ [asc: :name]),
    do: from(r in query, order_by: ^order)

  @valid ~w(name description repository_id provider private)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_assoc(:dependencies)
    |> cast_embed(:oidc_settings)
    |> cast_embed(:tests)
    |> foreign_key_constraint(:repository_id)
    |> unique_constraint(:name, index: index_name(:recipes, [:repository_id, :name]))
    |> validate_required([:name, :repository_id])
  end
end
