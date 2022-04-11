defmodule GraphQl.Schema.Repository do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{
    User,
    Payments,
    Repository,
    Dependencies,
    Tag,
    Account
  }

  ### INPUTS

  ecto_enum :category, Core.Schema.Repository.Category
  ecto_enum :oidc_auth_method, Core.Schema.OIDCProvider.AuthMethod

  input_object :repository_attributes do
    field :name,           :string
    field :description,    :string
    field :documentation,  :string
    field :category,       :category
    field :secrets,        :yml
    field :icon,           :upload_or_url
    field :dark_icon,      :upload_or_url
    field :tags,           list_of(:tag_attributes)
    field :private,        :boolean
    field :notes,          :string
    field :default_tag,    :string
    field :oauth_settings, :oauth_settings_attributes
    field :integration_resource_definition, :resource_definition_attributes
  end

  input_object :oauth_settings_attributes do
    field :uri_format,  non_null(:string)
    field :auth_method, non_null(:oidc_auth_method)
  end

  input_object :installation_attributes do
    field :context,      :yml
    field :auto_upgrade, :boolean
    field :track_tag,    :string
  end

  input_object :integration_attributes do
    field :name,          non_null(:string)
    field :icon,          :upload_or_url
    field :source_url,    :string
    field :description,   :string
    field :type,          :string
    field :spec,          :yml
    field :tags,          list_of(:tag_attributes)
  end

  input_object :resource_definition_attributes do
    field :name, non_null(:string)
    field :spec, list_of(:specification_attributes)
  end

  ecto_enum :spec_datatype, Core.Schema.ResourceDefinition.Specification.Type

  input_object :specification_attributes do
    field :name,     non_null(:string)
    field :type,     non_null(:spec_datatype)
    field :inner,    :spec_datatype
    field :spec,     list_of(:specification_attributes)
    field :required, :boolean
  end

  input_object :artifact_attributes do
    field :name,     non_null(:string)
    field :readme,   non_null(:string)
    field :type,     non_null(:string)
    field :platform, non_null(:string)
    field :arch,     :string
    field :blob,     :upload_or_url
  end

  input_object :oidc_attributes do
    field :redirect_uris, list_of(:string)
    field :auth_method, non_null(:oidc_auth_method)
    field :bindings, list_of(:binding_attributes)
  end

  input_object :lock_attributes do
    field :lock, non_null(:string)
  end

  ## OBJECTS

  object :category_info do
    field :category, :category
    field :count,    :integer

    connection field :tags, node_type: :grouped_tag do
      arg :q, :string
      resolve &Tag.category_tags/2
    end
  end

  object :installation do
    field :id,            non_null(:id)
    field :context,       :map
    field :auto_upgrade,  :boolean
    field :repository,    :repository, resolve: dataloader(Repository)
    field :user,          :user, resolve: dataloader(User)
    field :subscription,  :repository_subscription, resolve: dataloader(Payments)
    field :oidc_provider, :oidc_provider, resolve: dataloader(Repository)
    field :license_key,   :string
    field :track_tag,     non_null(:string)

    field :acme_key_id, :string, resolve: fn
      _, _, _ -> {:ok, Core.conf(:acme_key_id)}
    end

    field :acme_secret, :string, resolve: fn
      _, _, _ -> {:ok, Core.conf(:acme_secret)}
    end


    field :license, :string, resolve: fn
      installation, _, _ -> Core.Services.Repositories.generate_license(installation)
    end

    timestamps()
  end

  object :repository do
    field :id,             non_null(:id)
    field :name,           non_null(:string)
    field :description,    :string
    field :documentation,  :string
    field :category,       :category
    field :private,        :boolean
    field :notes,          :string
    field :default_tag,    :string
    field :publisher,      :publisher, resolve: dataloader(User)
    field :plans,          list_of(:plan), resolve: dataloader(Payments)
    field :tags,           list_of(:tag), resolve: dataloader(Repository)
    field :artifacts,      list_of(:artifact), resolve: dataloader(Repository)
    field :recipes,        list_of(:recipe), resolve: dataloader(Repository)
    field :oauth_settings, :oauth_settings

    image :icon
    image :dark_icon

    field :installation, :installation, resolve: fn
      repo, _, context -> Repository.resolve_installation(repo, context)
    end

    field :editable, :boolean, resolve: fn
      repo, _, %{context: %{current_user: user}} -> Repository.editable(repo, user)
    end

    field :secrets, :map, resolve: fn
      repo, _, %{context: %{current_user: user}} -> Repository.protected_field(repo, user, :secrets)
    end

    field :public_key, :string, resolve: fn
      repo, _, %{context: %{current_user: user}} -> Repository.resolve_public_key(repo, user)
    end

    timestamps()
  end

  object :artifact do
    field :id,       :id
    field :name,     :string
    field :readme,   :string
    field :type,     :artifact_type
    field :platform, :artifact_platform
    field :filesize, :integer
    field :sha,      :string
    field :arch,     :string
    field :blob, :string, resolve: fn
      artifact, _, _ -> {:ok, Core.Storage.url({artifact.blob, artifact}, :original)}
    end

    timestamps()
  end

  ecto_enum :artifact_type, Core.Schema.Artifact.Type
  ecto_enum :artifact_platform, Core.Schema.Artifact.Platform

  object :integration do
    field :id,          non_null(:id)
    field :name,        non_null(:string)
    field :source_url,  :string
    field :description, :string
    field :type,        :string
    field :spec,        :map

    field :icon, :string, resolve: fn
      integration, _, _ -> {:ok, Core.Storage.url({integration.icon, integration}, :original)}
    end

    field :repository, :repository, resolve: dataloader(Repository)
    field :publisher,  :publisher, resolve: dataloader(User)
    field :tags,       list_of(:tag), resolve: dataloader(Repository)

    timestamps()
  end

  object :oidc_provider do
    field :id,            non_null(:id)
    field :client_secret, non_null(:string)
    field :client_id,     non_null(:string)
    field :redirect_uris, list_of(:string)
    field :auth_method,   non_null(:oidc_auth_method)
    field :configuration, :ouath_configuration, resolve: &GraphQl.Resolvers.OAuth.resolve_configuration/2

    field :bindings, list_of(:oidc_provider_binding), resolve: dataloader(Repository)

    timestamps()
  end

  object :oidc_provider_binding do
    field :id,    non_null(:id)
    field :user,  :user, resolve: dataloader(User)
    field :group, :group, resolve: dataloader(Account)

    timestamps()
  end

  object :oauth_settings do
    field :uri_format,  non_null(:string)
    field :auth_method, non_null(:oidc_auth_method)
  end

  object :apply_lock do
    field :id,   non_null(:id)
    field :lock, :string

    field :repository, :repository, resolve: dataloader(Repository)
    field :owner, :user, resolve: dataloader(User)

    timestamps()
  end

  object :scaffold_file do
    field :path,    :string
    field :content, :string
  end

  connection node_type: :repository
  connection node_type: :installation
  connection node_type: :integration

  object :repository_queries do
    field :repository, :repository do
      middleware Authenticated
      arg :id,   :id
      arg :name, :string

      resolve &Repository.resolve_repository/2
    end

    field :installation, :installation do
      middleware Authenticated, :external
      arg :id,   :id
      arg :name, :string

      resolve &Repository.resolve_installation/2
    end


    connection field :repositories, node_type: :repository do
      arg :publisher_id, :id
      arg :q,            :string
      arg :tag,          :string
      arg :supports,     :boolean
      arg :installed,    :boolean
      arg :category,     :category

      resolve &Repository.list_repositories/2
    end

    connection field :search_repositories, node_type: :repository do
      arg :query, non_null(:string)

      resolve &Repository.search_repositories/2
    end

    connection field :installations, node_type: :installation do
      middleware Authenticated, :external

      resolve &Repository.list_installations/2
    end

    connection field :integrations, node_type: :integration do
      arg :repository_id,   :id
      arg :repository_name, :string
      arg :tag,             :string
      arg :type,            :string

      resolve &Repository.list_integrations/2
    end

    field :closure, list_of(:closure_item) do
      middleware Authenticated
      arg :id, non_null(:id)
      arg :type, non_null(:dependency_type)

      resolve &Dependencies.resolve_closure/2
    end

    field :categories, list_of(:category_info) do
      middleware Authenticated

      resolve &Repository.list_categories/2
    end

    field :category, :category_info do
      middleware Authenticated
      arg :name, non_null(:category)

      resolve &Repository.resolve_category/2
    end

    field :scaffold, list_of(:scaffold_file) do
      arg :application, non_null(:string)
      arg :category,    non_null(:category)
      arg :publisher,   non_null(:string)
      arg :ingress,     :boolean
      arg :postgres,    :boolean

      resolve &Repository.generate_scaffold/2
    end
  end

  object :repository_mutations do
    field :create_repository, :repository do
      middleware Authenticated
      arg :id,         :id
      arg :attributes, non_null(:repository_attributes)

      resolve safe_resolver(&Repository.create_repository/2)
    end


    field :update_repository, :repository do
      middleware Authenticated
      arg :repository_id,   :id
      arg :repository_name, :string
      arg :attributes,      non_null(:repository_attributes)

      resolve safe_resolver(&Repository.update_repository/2)
    end

    field :upsert_repository, :repository do
      middleware Authenticated
      arg :attributes, non_null(:repository_attributes)
      arg :name,       non_null(:string)
      arg :publisher,  non_null(:string)

      resolve safe_resolver(&Repository.upsert_repository/2)
    end

    field :delete_repository, :repository do
      middleware Authenticated
      arg :repository_id, non_null(:id)

      resolve safe_resolver(&Repository.delete_repository/2)
    end

    field :create_installation, :installation do
      middleware Authenticated
      arg :repository_id, non_null(:id)

      resolve safe_resolver(&Repository.create_installation/2)
    end

    field :update_installation, :installation do
      middleware Authenticated
      arg :id, non_null(:id)
      arg :attributes, non_null(:installation_attributes)

      resolve safe_resolver(&Repository.update_installation/2)
    end

    field :delete_installation, :installation do
      middleware Authenticated
      arg :id, non_null(:id)

      resolve safe_resolver(&Repository.delete_installation/2)
    end

    field :create_integration, :integration do
      middleware Authenticated
      arg :repository_name, non_null(:string)
      arg :attributes, non_null(:integration_attributes)

      resolve safe_resolver(&Repository.upsert_integration/2)
    end

    field :create_artifact, :artifact do
      middleware Authenticated
      arg :repository_id,   :id
      arg :repository_name, :string
      arg :attributes, non_null(:artifact_attributes)

      resolve safe_resolver(&Repository.create_artifact/2)
    end

    field :create_oidc_provider, :oidc_provider do
      middleware Authenticated, :external
      arg :installation_id, non_null(:id)
      arg :attributes, non_null(:oidc_attributes)

      resolve safe_resolver(&Repository.create_oidc_provider/2)
    end

    field :update_oidc_provider, :oidc_provider do
      middleware Authenticated, :external
      arg :installation_id, non_null(:id)
      arg :attributes, non_null(:oidc_attributes)

      resolve safe_resolver(&Repository.update_oidc_provider/2)
    end

    field :upsert_oidc_provider, :oidc_provider do
      middleware Authenticated, :external
      arg :installation_id, non_null(:id)
      arg :attributes, non_null(:oidc_attributes)

      resolve safe_resolver(&Repository.upsert_oidc_provider/2)
    end

    field :acquire_lock, :apply_lock do
      middleware Authenticated
      arg :repository, non_null(:string)

      resolve safe_resolver(&Repository.acquire_apply_lock/2)
    end

    field :release_lock, :apply_lock do
      middleware Authenticated
      arg :repository, non_null(:string)
      arg :attributes, non_null(:lock_attributes)

      resolve safe_resolver(&Repository.release_apply_lock/2)
    end
  end
end
