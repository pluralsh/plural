defmodule GraphQl.Schema.Shell do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.Shell
  alias Core.Shell.Client.{Application, ApplicationStatus, ApplicationSpec}

  ecto_enum :demo_project_state, Core.Schema.DemoProject.State

  input_object :cloud_shell_attributes do
    field :provider,    :provider
    field :workspace,   non_null(:workspace_attributes)
    field :credentials, non_null(:shell_credentials_attributes)
    field :scm,         :scm_attributes
    field :demo_id,     :id
  end

  enum :scm_provider do
    value :github
    value :gitlab
    value :manual
    value :demo
  end

  input_object :scm_attributes do
    field :provider,    :scm_provider
    field :token,       :string
    field :name,        :string
    field :org,         :string
    field :git_url,     :string
    field :public_key,  :string
    field :private_key, :string
  end

  input_object :workspace_attributes do
    field :cluster,       non_null(:string)
    field :bucket_prefix, non_null(:string)
    field :region,        non_null(:string)
    field :project,       :string
    field :subdomain,     non_null(:string)
  end

  input_object :shell_credentials_attributes do
    field :aws,   :aws_shell_credentials_attributes
    field :gcp,   :gcp_shell_credentials_attributes
    field :azure, :azure_shell_credentials_attributes
  end

  input_object :aws_shell_credentials_attributes do
    field :access_key_id,     non_null(:string)
    field :secret_access_key, non_null(:string)
  end

  input_object :gcp_shell_credentials_attributes do
    field :application_credentials, non_null(:string)
  end

  input_object :azure_shell_credentials_attributes do
    field :tenant_id,       non_null(:string)
    field :client_id,       non_null(:string)
    field :client_secret,   non_null(:string)
    field :storage_account, non_null(:string)
    field :subscription_id, non_null(:string)
  end

  input_object :context_attributes do
    field :configuration, non_null(:map)
    field :buckets,       list_of(:string)
    field :domains,       list_of(:string)
  end

  object :cloud_shell do
    field :id,          non_null(:id)
    field :provider,    non_null(:provider)
    field :git_url,     non_null(:string)
    field :aes_key,     non_null(:string)
    field :missing,     list_of(:string)

    field :cluster,     non_null(:string), resolve: fn
      %{workspace: %{cluster: cluster}}, _, _ -> {:ok, cluster}
    end

    field :subdomain,     non_null(:string), resolve: fn
      %{workspace: %{subdomain: subdomain}}, _, _ -> {:ok, subdomain}
    end

    field :alive,       non_null(:boolean), resolve: fn
      shell, _, _ -> Shell.liveness(shell)
    end

    field :status, :shell_status, resolve: fn
      shell, _, _ -> Shell.status(shell)
    end

    field :region, non_null(:string), resolve: fn
      %{workspace: %{region: region}}, _, _ -> {:ok, region}
    end

    timestamps()
  end

  object :shell_configuration do
    field :workspace,             :shell_workspace
    field :git,                   :git_configuration
    field :context_configuration, :map
    field :buckets,               list_of(:string)
    field :domains,               list_of(:string)
  end

  object :shell_workspace do
    field :network,       :network_configuration
    field :bucket_prefix, :string
    field :cluster,       :string
    field :region,        :string
  end

  object :network_configuration do
    field :plural_dns, :boolean
    field :subdomain,  :string
  end

  object :git_configuration do
    field :url,    :string
    field :name,   :string
    field :root,   :string
    field :branch, :string
  end

  object :shell_status do
    field :ready,            :boolean
    field :initialized,      :boolean
    field :containers_ready, :boolean
    field :pod_scheduled,    :boolean
  end

  object :authorization_url do
    field :provider, non_null(:scm_provider)
    field :url,      non_null(:string)
  end

  object :demo_project do
    field :id,          non_null(:id)
    field :project_id,  non_null(:string)
    field :credentials, :string
    field :ready,       :boolean
    field :state,       :demo_project_state

    timestamps()
  end

  object :application_information do
    field :name, non_null(:string), resolve: fn
      %Application{metadata: %{name: name}}, _, _ -> {:ok, name}
    end

    field :ready, :boolean, resolve: fn
      app, _, _ -> {:ok, Application.ready?(app)}
    end

    field :components_ready, :string, resolve: fn
      %Application{status: %ApplicationStatus{componentsReady: r}}, _, _ -> {:ok, r}
    end

    field :components, list_of(:application_component), resolve: fn
      %Application{status: %ApplicationStatus{components: components}}, _, _ -> {:ok, components}
    end

    field :spec, :application_spec
  end

  object :application_spec do
    field :description, :string, resolve: fn
      %ApplicationSpec{descriptor: %ApplicationSpec.Descriptor{description: desc}}, _, _ ->
        {:ok, desc}
    end

    field :version, :string, resolve: fn
      %ApplicationSpec{descriptor: %ApplicationSpec.Descriptor{version: vsn}}, _, _ ->
        {:ok, vsn}
    end

    field :links, list_of(:app_link), resolve: fn
      %ApplicationSpec{descriptor: %ApplicationSpec.Descriptor{links: links}}, _, _ ->
        {:ok, links}
    end
  end

  object :app_link do
    field :url,         :string
    field :description, :string
  end

  object :application_component do
    field :group,   :string
    field :name,    :string
    field :kind,    :string
    field :status,  :string
  end

  object :shell_queries do
    field :shell, :cloud_shell do
      middleware Authenticated
      resolve &Shell.resolve_shell/2
    end

    field :shell_configuration, :shell_configuration do
      middleware Authenticated
      resolve &Shell.resolve_shell_configuration/2
    end

    field :shell_applications, list_of(:application_information) do
      middleware Authenticated
      resolve &Shell.resolve_applications/2
    end

    field :scm_authorization, list_of(:authorization_url) do
      middleware Authenticated
      resolve &Shell.authorize_urls/2
    end

    field :scm_token, :string do
      middleware Authenticated
      arg :provider, non_null(:scm_provider)
      arg :code,     non_null(:string)

      resolve &Shell.get_token/2
    end

    field :demo_project, :demo_project do
      middleware Authenticated
      arg :id, :id

      safe_resolve &Shell.get_demo_project/2
    end
  end

  object :shell_mutations do
    field :create_shell, :cloud_shell do
      middleware Authenticated
      arg :attributes, non_null(:cloud_shell_attributes)

      safe_resolve &Shell.create_shell/2
    end

    field :setup_shell, :cloud_shell do
      middleware Authenticated

      safe_resolve &Shell.setup_shell/2
    end

    field :update_shell, :cloud_shell do
      middleware Authenticated
      arg :attributes, non_null(:cloud_shell_attributes)

      safe_resolve &Shell.update_shell/2
    end

    field :update_shell_configuration, :boolean do
      middleware Authenticated
      arg :context, non_null(:map)

      safe_resolve &Shell.update_shell_configuration/2
    end

    field :install_bundle, list_of(:installation) do
      middleware Authenticated
      arg :context, non_null(:context_attributes)
      arg :oidc,    non_null(:boolean)
      arg :repo,    non_null(:string)
      arg :name,    non_null(:string)

      safe_resolve &Shell.install_bundle/2
    end

    field :install_stack_shell, list_of(:recipe) do
      middleware Authenticated
      arg :name, non_null(:string)
      arg :oidc, non_null(:boolean)
      arg :context, non_null(:context_attributes)

      safe_resolve &Shell.install_stack/2
    end

    field :reboot_shell, :cloud_shell do
      middleware Authenticated
      safe_resolve &Shell.reboot/2
    end

    field :delete_shell, :cloud_shell do
      middleware Authenticated
      safe_resolve &Shell.delete_shell/2
    end

    field :create_demo_project, :demo_project do
      middleware Authenticated

      safe_resolve &Shell.create_demo_project/2
    end

    field :transfer_demo_project, :demo_project do
      middleware Authenticated
      arg :organization_id, non_null(:string)

      safe_resolve &Shell.transfer_demo_project/2
    end

    field :delete_demo_project, :demo_project do
      middleware Authenticated
      safe_resolve &Shell.delete_demo_project/2
    end

    field :stop_shell, :boolean do
      middleware Authenticated
      safe_resolve &Shell.stop/2
    end

    field :restart_shell, :boolean do
      middleware Authenticated
      safe_resolve &Shell.restart/2
    end
  end
end
