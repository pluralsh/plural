defmodule GraphQl do
  use Absinthe.Schema
  use Absinthe.Relay.Schema, :modern

  import_types Absinthe.Plug.Types
  import_types GraphQl.Schemas.Upload
  import_types GraphQl.Schema.Misc
  import_types GraphQl.Schema.Metric
  import_types GraphQl.Schema.User
  import_types GraphQl.Schema.Payments
  import_types GraphQl.Schema.Repository
  import_types GraphQl.Schema.Recipe
  import_types GraphQl.Schema.Chart
  import_types GraphQl.Schema.Terraform
  import_types GraphQl.Schema.Docker
  import_types GraphQl.Schema.Version
  import_types GraphQl.Schema.Account
  import_types GraphQl.Schema.Incidents
  import_types GraphQl.Schema.Audit
  import_types GraphQl.Schema.Upgrade
  import_types GraphQl.Schema.Rollout
  import_types GraphQl.Schema.OAuth
  import_types GraphQl.Schema.Dns
  import_types GraphQl.Schema.Shell

  alias GraphQl.Resolvers.{
    User,
    Chart,
    Repository,
    Terraform,
    Docker,
    Recipe,
    Tag,
    Payments,
    Version,
    Account,
    Incidents,
    Rollout,
    Dns
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
    Version,
    Account,
    Incidents,
    Rollout,
    Dns
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

  def middleware(middleware, _field, %{identifier: type}) when type in [:query, :mutation] do
    Enum.map(middleware, &GraphQl.ExceptionMiddleware.wrap/1)
  end
  def middleware(middleware, _, _), do: middleware

  query do
    field :configuration, :plural_configuration do
      resolve fn _, _ -> {:ok, Core.Configuration.new()} end
    end

    connection field :tags, node_type: :grouped_tag do
      arg :id,   :id
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
    import_fields :account_queries
    import_fields :incident_queries
    import_fields :audit_queries
    import_fields :upgrade_queries
    import_fields :rollout_queries
    import_fields :oauth_queries
    import_fields :dns_queries
    import_fields :shell_queries
    import_fields :metric_queries
  end

  mutation do
    import_fields :user_mutations
    import_fields :payment_mutations
    import_fields :repository_mutations
    import_fields :recipe_mutations
    import_fields :chart_mutations
    import_fields :terraform_mutations
    import_fields :version_mutations
    import_fields :account_mutations
    import_fields :incident_mutations
    import_fields :upgrade_mutations
    import_fields :oauth_mutations
    import_fields :docker_mutations
    import_fields :dns_mutations
    import_fields :shell_mutations
  end

  subscription do
    import_fields :incident_subscriptions
    import_fields :upgrade_subscriptions
    import_fields :rollout_subscriptions
  end
end
