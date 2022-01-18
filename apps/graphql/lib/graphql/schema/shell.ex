defmodule GraphQl.Schema.Shell do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.Shell

  input_object :cloud_shell_attributes do
    field :provider,        :provider
    field :git_url,         non_null(:string)
    field :ssh_public_key,  non_null(:string)
    field :ssh_private_key, non_null(:string)
    field :workspace,       non_null(:workspace_attributes)
    field :credentials,     non_null(:shell_credentials_attributes)
  end

  input_object :workspace_attributes do
    field :cluster,       non_null(:string)
    field :bucket_prefix, non_null(:string)
    field :region,        non_null(:string)
    field :project,       :string
    field :subdomain,     non_null(:string)
  end

  input_object :shell_credentials_attributes do
    field :aws, :aws_shell_credentials_attributes
  end

  input_object :aws_shell_credentials_attributes do
    field :access_key_id,     non_null(:string)
    field :secret_access_key, non_null(:string)
  end

  object :cloud_shell do
    field :id,          non_null(:id)
    field :provider,    non_null(:provider)
    field :git_url,     non_null(:string)
    field :aes_key,     non_null(:string)
    field :alive,       non_null(:boolean), resolve: fn
      shell, _, _ -> Shell.liveness(shell)
    end

    timestamps()
  end

  object :shell_queries do
    field :shell, :cloud_shell do
      middleware Authenticated
      resolve &Shell.resolve_shell/2
    end
  end

  object :shell_mutations do
    field :create_shell, :cloud_shell do
      middleware Authenticated
      arg :attributes, non_null(:cloud_shell_attributes)

      resolve &Shell.create_shell/2
    end
  end
end
