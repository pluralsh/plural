defmodule GraphQl.Schema.Version do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{
    Chart,
    Version,
    Terraform,
    Docker
  }

  input_object :version_spec do
    field :repository, :string
    field :chart,      :string
    field :terraform,  :string
    field :version,    :string
  end

  input_object :version_attributes do
    field :tags, list_of(:version_tag_attributes)
  end

  input_object :version_tag_attributes do
    field :version_id, :id
    field :tag, non_null(:string)
  end

  @desc "The version of a package."
  object :version do
    field :id,              non_null(:id)
    field :version,         non_null(:string)
    field :readme,          :string
    field :values_template, :string
    field :template_type,   :template_type, description: "The template engine used to render the valuesTemplate."
    field :helm,            :map
    field :tags,            list_of(:version_tag), resolve: dataloader(Version)
    field :dependencies,    :dependencies
    field :package,         :string, resolve: fn
      v, _, _ -> {:ok, Core.Storage.url({v.package, v}, :original)}
    end

    field :chart,     :chart, resolve: dataloader(Chart)
    field :terraform, :terraform, resolve: dataloader(Terraform)
    field :crds,      list_of(:crd), resolve: dataloader(Chart)
    field :scan,      :package_scan, resolve: dataloader(Version)
    field :image_dependencies, list_of(:image_dependency), resolve: dataloader(Docker)

    timestamps()
  end

  @desc "Template engines that can be used at build time."
  ecto_enum :template_type, Core.Schema.Version.TemplateType

  object :package_scan do
    field :id, non_null(:id)
    field :grade, :image_grade

    field :violations, list_of(:scan_violation), resolve: dataloader(Version)
    field :errors, list_of(:scan_error), resolve: dataloader(Version)

    timestamps()
  end

  object :scan_violation do
    field :rule_name,     :string
    field :description,   :string
    field :rule_id,       :string
    field :severity,      :vuln_grade
    field :category,      :string
    field :resource_name, :string
    field :resource_type, :string
    field :line,          :integer
    field :file,          :string

    timestamps()
  end

  object :scan_error do
    field :message, :string
  end

  object :version_tag do
    field :id,      non_null(:id)
    field :tag,     non_null(:string)
    field :version, :version, resolve: dataloader(Version)
    field :chart,   :chart, resolve: dataloader(Chart)

    timestamps()
  end

  object :dependencies do
    field :dependencies,     list_of(:dependency)
    field :providers,        list_of(:provider)
    field :secrets,          list_of(:string)
    field :provider_vsn,     :string
    field :application,      :boolean
    field :provider_wirings, :map
    field :outputs,          :map
    field :wirings,          :wirings
    field :breaking,         :boolean
    field :wait,             :boolean
    field :instructions,     :change_instructions
  end

  object :change_instructions do
    field :script,       :string
    field :instructions, :string
  end

  ecto_enum :dependency_type, Core.Schema.Dependencies.Dependency.Type

  object :dependency do
    field :type,     :dependency_type
    field :name,     :string
    field :repo,     :string
    field :version,  :string
    field :optional, :boolean
  end

  object :wirings do
    field :terraform, :map
    field :helm, :map
  end

  connection node_type: :version

  object :version_queries do
    connection field :versions, node_type: :version do
      middleware Authenticated
      arg :chart_id,     :id
      arg :terraform_id, :id

      resolve &Version.list_versions/2
    end
  end

  object :version_mutations do
    field :update_version, :version do
      middleware Authenticated
      arg :id,         :id
      arg :spec,       :version_spec
      arg :attributes, non_null(:version_attributes)

      resolve safe_resolver(&Version.update_version/2)
    end
  end
end
