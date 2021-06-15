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

  object :version do
    field :id,              non_null(:id)
    field :version,         non_null(:string)
    field :readme,          :string
    field :values_template, :string
    field :helm,            :map
    field :tags,            list_of(:version_tag), resolve: dataloader(Version)
    field :dependencies,    :dependencies
    field :package,         :string, resolve: fn
      v, _, _ -> {:ok, Core.Storage.url({v.package, v}, :original)}
    end

    field :chart,     :chart, resolve: dataloader(Chart)
    field :terraform, :terraform, resolve: dataloader(Terraform)
    field :crds,      list_of(:crd), resolve: dataloader(Chart)
    field :image_dependencies, list_of(:image_dependency), resolve: dataloader(Docker)

    timestamps()
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
    field :application,      :boolean
    field :provider_wirings, :map
    field :outputs,          :map
    field :wirings,          :wirings
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
      middleware GraphQl.Middleware.Authenticated
      arg :chart_id,     :id
      arg :terraform_id, :id

      resolve &Version.list_versions/2
    end
  end

  object :version_mutations do
    field :update_version, :version do
      middleware GraphQl.Middleware.Authenticated
      arg :id,         :id
      arg :spec,       :version_spec
      arg :attributes, non_null(:version_attributes)

      resolve safe_resolver(&Version.update_version/2)
    end
  end
end
