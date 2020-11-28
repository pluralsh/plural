defmodule GraphQl do
  use Absinthe.Schema
  use Absinthe.Relay.Schema, :modern

  import_types Absinthe.Plug.Types
  import_types GraphQl.Schema.Misc
  import_types GraphQl.Schemas.Upload
  import_types GraphQl.Schema.User
  import_types GraphQl.Schema.Payments
  import_types GraphQl.Schema.Repository
  import_types GraphQl.Schema.Recipe
  import_types GraphQl.Schema.Chart
  import_types GraphQl.Schema.Terraform
  import_types GraphQl.Schema.Docker
  import_types GraphQl.Schema.Version

  alias GraphQl.Resolvers.{
    User,
    Chart,
    Repository,
    Terraform,
    Docker,
    Dependencies,
    Recipe,
    Tag,
    Payments,
    Version
  }

  @sources [
    User,
    Chart,
    Repository,
    Terraform,
    Docker,
    Recipe,
    Tag,
    Payments,
    Version
  ]

  def context(ctx) do
    loader = make_dataloader(@sources, ctx)

    Map.put(ctx, :loader, loader)
  end

  defp make_dataloader(sources, ctx) do
    Enum.reduce(sources, Dataloader.new(), fn source, loader ->
      Dataloader.add_source(loader, source, source.data(ctx))
    end)
  end

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end

  query do
    field :closure, :closure do
      middleware GraphQl.Middleware.Authenticated
      arg :id, non_null(:id)
      arg :type, non_null(:dependency_type)

      resolve &Dependencies.resolve_closure/2
    end

    connection field :tags, node_type: :grouped_tag do
      arg :id,   :string
      arg :type, non_null(:tag_group)
      arg :q,    :string

      resolve &Tag.grouped_tags/2
    end

    import_fields :user_queries
    import_fields :payment_queries
    import_fields :repository_queries
    import_fields :recipe_queries
    import_fields :chart_queries
    import_fields :terraform_queries
    import_fields :docker_queries
    import_fields :version_queries
  end

  mutation do
    import_fields :user_mutations
    import_fields :payment_mutations
    import_fields :repository_mutations
    import_fields :recipe_mutations
    import_fields :chart_mutations
    import_fields :terraform_mutations
    import_fields :version_mutations
  end
end
