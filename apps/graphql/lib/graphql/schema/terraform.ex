defmodule GraphQl.Schema.Terraform do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{
    Terraform,
    Repository,
    Version
  }

  input_object :terraform_attributes do
    field :name,         :string
    field :description,  :string
    field :package,      :upload_or_url
    field :dependencies, :yml
  end

  input_object :terraform_installation_attributes do
    field :terraform_id, :id
  end

  object :terraform_installation do
    field :id,           :id
    field :terraform,    :terraform, resolve: dataloader(Terraform)
    field :installation, :installation, resolve: dataloader(Repository)
    field :version,      :version, resolve: dataloader(Version)

    timestamps()
  end

  object :terraform do
    field :id,              :id
    field :name,            :string
    field :readme,          :string
    field :description,     :string
    field :values_template, :string
    field :latest_version,  :string
    field :dependencies,    :dependencies

    field :package,     :string, resolve: fn
      repo, _, _ -> {:ok, Core.Storage.url({repo.package, repo}, :original)}
    end
    field :repository,  :repository, resolve: dataloader(Repository)
    field :editable,    :boolean, resolve: fn
      tf, _, %{context: %{current_user: user}} -> Terraform.editable(tf, user)
    end

    field :installation, :terraform_installation, resolve: fn
      terraform, _, %{context: %{current_user: user}} ->
        Terraform.resolve_terraform_installation(terraform, user)
    end

    timestamps()
  end

  connection node_type: :terraform
  connection node_type: :terraform_installation

  object :terraform_queries do
    field :terraform_module, :terraform do
      middleware GraphQl.Middleware.Authenticated
      arg :id, non_null(:id)

      resolve &Terraform.resolve_terraform/2
    end

    connection field :terraform, node_type: :terraform do
      middleware GraphQl.Middleware.Authenticated
      arg :repository_id, non_null(:id)

      resolve &Terraform.list_terraform/2
    end

    connection field :terraform_installations, node_type: :terraform_installation do
      middleware GraphQl.Middleware.Authenticated
      arg :repository_id, non_null(:id)

      resolve &Terraform.list_terraform_installations/2
    end
  end

  object :terraform_mutations do
    field :create_terraform, :terraform do
      middleware GraphQl.Middleware.Authenticated
      arg :repository_id, non_null(:id)
      arg :attributes, non_null(:terraform_attributes)

      resolve safe_resolver(&Terraform.create_terraform/2)
    end

    field :update_terraform, :terraform do
      middleware GraphQl.Middleware.Authenticated
      arg :id, non_null(:id)
      arg :attributes, non_null(:terraform_attributes)

      resolve safe_resolver(&Terraform.update_terraform/2)
    end

    field :delete_terraform, :terraform do
      middleware GraphQl.Middleware.Authenticated
      arg :id, non_null(:id)

      resolve safe_resolver(&Terraform.delete_terraform/2)
    end

    field :upload_terraform, :terraform do
      middleware GraphQl.Middleware.Authenticated
      arg :repository_name, non_null(:string)
      arg :name, non_null(:string)
      arg :attributes, non_null(:terraform_attributes)

      resolve safe_resolver(&Terraform.upsert_terraform/2)
    end

    field :install_terraform, :terraform_installation do
      middleware GraphQl.Middleware.Authenticated
      arg :installation_id, non_null(:id)
      arg :attributes, non_null(:terraform_installation_attributes)

      resolve safe_resolver(&Terraform.create_terraform_installation/2)
    end

    field :uninstall_terraform, :terraform_installation do
      middleware GraphQl.Middleware.Authenticated
      arg :id, non_null(:id)

      resolve safe_resolver(&Terraform.delete_terraform_installation/2)
    end
  end
end