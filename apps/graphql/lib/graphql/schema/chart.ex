defmodule GraphQl.Schema.Chart do
  use GraphQl.Schema.Base
  alias GraphQl.Middleware.Accessible
  alias GraphQl.Resolvers.{
    Chart,
    Repository,
    Version
  }

  input_object :chart_name do
    field :repo,  :string
    field :chart, :string
  end

  input_object :chart_installation_attributes do
    field :chart_id,   :id
    field :version_id, :id
  end

  input_object :chart_attributes do
    field :tags, list_of(:version_tag_attributes)
  end

  input_object :crd_attributes do
    field :name, non_null(:string)
    field :blob, :upload_or_url
  end

  object :chart do
    field :id,             :id
    field :name,           non_null(:string)
    field :description,    :string
    field :latest_version, :string
    field :repository,     :repository, resolve: dataloader(Repository)
    field :dependencies,   :dependencies
    field :tags,           list_of(:version_tag), resolve: dataloader(Version)

    field :installation, :chart_installation, resolve: fn
      chart, _, %{context: %{current_user: user}} ->
        Chart.resolve_chart_installation(chart, user)
    end

    timestamps()
  end

  object :chart_installation do
    field :id,           :id
    field :chart,        :chart, resolve: dataloader(Chart)
    field :version,      :version, resolve: dataloader(Version)
    field :installation, :installation, resolve: dataloader(Repository)

    timestamps()
  end

  object :crd do
    field :id,   non_null(:id)
    field :name, non_null(:string)
    field :blob, :string, resolve: fn
      crd, _, _ -> {:ok, Core.Storage.url({crd.blob, crd}, :original)}
    end

    timestamps()
  end

  connection node_type: :chart
  connection node_type: :chart_installation

  object :chart_queries do
    field :chart, :chart do
      middleware Authenticated
      arg :id, non_null(:id)

      resolve &Chart.resolve_chart/2
    end

    connection field :charts, node_type: :chart do
      middleware Authenticated
      middleware Accessible
      arg :repository_id, non_null(:id)

      resolve &Chart.list_charts/2
    end

    connection field :chart_installations, node_type: :chart_installation do
      middleware Authenticated
      arg :repository_id, non_null(:id)

      resolve &Chart.list_chart_installations/2
    end
  end

  object :chart_mutations do
    field :update_chart, :chart do
      middleware Authenticated
      arg :id,         non_null(:id)
      arg :attributes, non_null(:chart_attributes)

      safe_resolve &Chart.update_chart/2
    end

    field :create_crd, :crd do
      middleware Authenticated
      arg :chart_id,   :id
      arg :chart_name, :chart_name
      arg :attributes, non_null(:crd_attributes)

      safe_resolve &Chart.create_crd/2
    end

    field :install_chart, :chart_installation do
      middleware Authenticated
      arg :installation_id, non_null(:id)
      arg :attributes, non_null(:chart_installation_attributes)

      safe_resolve &Chart.install_chart/2
    end

    field :update_chart_installation, :chart_installation do
      middleware Authenticated
      arg :chart_installation_id, non_null(:id)
      arg :attributes, non_null(:chart_installation_attributes)

      safe_resolve &Chart.update_chart_installation/2
    end

    field :delete_chart_installation, :chart_installation do
      middleware Authenticated
      arg :id, non_null(:id)

      safe_resolve &Chart.delete_chart_installation/2
    end
  end
end
