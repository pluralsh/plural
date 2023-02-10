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

  @desc "Application categories."
  ecto_enum :category, Core.Schema.Repository.Category

  @desc "Supported OIDC authentication methods."
  ecto_enum :oidc_auth_method, Core.Schema.OIDCProvider.AuthMethod

  @desc "Input for creating or updating an application's attributes."
  input_object :repository_attributes do
    field :name,           :string, description: "The name of the application."
    field :description,    :string, description: "A short description of the application."
    field :documentation,  :string, description: "A link to the application's documentation."
    field :category,       :category, description: "The category of the application."
    field :secrets,        :yml, description: "A YAML object of secrets."
    field :icon,           :upload_or_url, description: "The application's icon."
    field :dark_icon,      :upload_or_url, description: "The application's dark icon."
    field :docs,           :upload_or_url, description: "The application's documentation."
    field :tags,           list_of(:tag_attributes), description: "The application's tags."
    field :private,        :boolean, description: "Whether the application is private."
    field :verified,       :boolean, description: "Whether the application is verified."
    field :trending,       :boolean, description: "Whether the application is trending."
    field :notes,          :string, description: "Notes about the application rendered after deploying and displayed to the user."
    field :default_tag,    :string, description: "The default tag to use when deploying the application."
    field :git_url,        :string, description: "The application's git URL."
    field :homepage,       :string, description: "The application's homepage."
    field :readme,         :string, description: "The application's README."
    field :oauth_settings, :oauth_settings_attributes, description: "The application's OAuth settings."
    field :integration_resource_definition, :resource_definition_attributes, description: "The application's integration resource definition."
    field :community,      :community_attributes, description: "The application's community links."
  end

  @desc "Input for the application's OAuth settings."
  input_object :oauth_settings_attributes do
    field :uri_format,  non_null(:string), description: "The URI format for the OAuth provider."
    field :auth_method, non_null(:oidc_auth_method), description: "The authentication method for the OAuth provider."
  end

  @desc "Input for creating or updating the tag attributes of an application installation."
  input_object :installation_attributes do
    field :context,      :yml, description: "A YAML object of context."
    field :auto_upgrade, :boolean, description: "Whether the application should auto upgrade."
    field :track_tag,    :string, description: "The tag to track for auto upgrades."
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

  @desc "Input for creating or updating the OIDC attributes of an application installation."
  input_object :oidc_attributes do
    field :redirect_uris, list_of(:string), description: "The redirect URIs for the OIDC provider."
    field :auth_method, non_null(:oidc_auth_method), description: "The authentication method for the OIDC provider."
    field :bindings, list_of(:binding_attributes), description: "The users or groups that can login through the OIDC provider."
  end

  input_object :lock_attributes do
    field :lock, non_null(:string)
  end

  @desc "Input for creating or updating the community links of an application."
  input_object :community_attributes do
    field :discord,  :string, description: "The application's Discord server."
    field :slack,    :string, description: "The application's Slack channel."
    field :twitter,  :string, description: "The application's Twitter account."
    field :homepage, :string, description: "The application's homepage."
    field :git_url,  :string, description: "The application's git URL."
    field :videos,   list_of(:string), description: "The videos of the application."
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

  @desc "An installation of an application."
  object :installation do
    field :id,            non_null(:id), description: "The installation's ID."
    field :context,       :map, description: "A YAML object of context."
    field :auto_upgrade,  :boolean, description: "Whether the application should auto upgrade."
    field :repository,    :repository, resolve: dataloader(Repository), description: "The application that was installed."
    field :user,          :user, resolve: dataloader(User), description: "The user that installed the application."
    field :subscription,  :repository_subscription, resolve: dataloader(Payments), description: "The subscription for the application."
    field :oidc_provider, :oidc_provider, resolve: dataloader(Repository), description: "The OIDC provider for the application."
    field :license_key,   :string, description: "The license key for the application."
    field :track_tag,     non_null(:string), description: "The tag to track for auto upgrades."

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

  object :license do
    field :name, :string
    field :url,  :string
  end

  object :community do
    field :discord,  :string
    field :slack,    :string
    field :twitter,  :string
    field :homepage, :string
    field :git_url,  :string
    field :videos,   list_of(:string)
  end

  @desc "Attributes of an application."
  object :repository do
    field :id,             non_null(:id), description: "The application's ID."
    field :name,           non_null(:string), description: "The name of the application."
    field :description,    :string, description: "The description of the application."
    field :documentation,  :string, description: "The documentation of the application."
    field :category,       :category, description: "The category of the application."
    field :private,        :boolean, description: "Whether the application is private."
    field :verified,       :boolean, description: "Whether the application is verified."
    field :trending,       :boolean, description: "Whether the application is trending."
    field :notes,          :string, description: "Notes about the application rendered after deploying and displayed to the user."
    field :default_tag,    :string, description: "The default tag to deploy."
    field :git_url,        :string, description: "The git URL of the application."
    field :main_branch,    :string, description: "The main branch of the application."
    field :readme,         :string, description: "The README of the application."
    field :license,        :license, description: "The license of the application."
    field :community,      :community, description: "The community links of the application."
    field :homepage,       :string, description: "The homepage of the application."
    field :publisher,      :publisher, resolve: dataloader(User), description: "The application publisher."
    field :plans,          list_of(:plan), resolve: dataloader(Payments), description: "The available plans for the application."
    field :tags,           list_of(:tag), resolve: dataloader(Repository), description: "The tags of the application."
    field :artifacts,      list_of(:artifact), resolve: dataloader(Repository), description: "The artifacts of the application."
    field :recipes,        list_of(:recipe), resolve: dataloader(Repository), description: "The recipes used to install the application."
    field :oauth_settings, :oauth_settings, description: "The OAuth settings for the application."

    image :icon, description: "The application's icon."
    image :dark_icon, description: "The application's dark icon."

    field :installation, :installation, resolve: dataloader(Repository), description: "The installation of the application by a user."

    @desc "If the application can be edited by the current user."
    field :editable, :boolean, resolve: fn
      repo, _, %{context: %{current_user: user}} -> Repository.editable(repo, user)
    end

    @desc "A map of secrets of the application."
    field :secrets, :map, resolve: fn
      repo, _, %{context: %{current_user: user}} -> Repository.protected_field(repo, user, :secrets)
    end

    @desc "The application's public key."
    field :public_key, :string, resolve: fn
      repo, _, %{context: %{current_user: user}} -> Repository.resolve_public_key(repo, user)
    end

    field :docs, list_of(:file_content), resolve: &Repository.documentation/3, description: "The documentation of the application."

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

    field :consent,  :consent_request

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
    @desc "Get an application by its ID or name."
    field :repository, :repository do
      middleware Authenticated
      arg :id,   :id, description: "The ID of the application."
      arg :name, :string, description: "The name of the application."

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
      arg :provider,     :provider

      # multiselects
      arg :categories,   list_of(:category)
      arg :tags,         list_of(:string)
      arg :publishers,   list_of(:id)

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

      safe_resolve &Repository.create_repository/2
    end


    field :update_repository, :repository do
      middleware Authenticated
      arg :repository_id,   :id
      arg :repository_name, :string
      arg :attributes,      non_null(:repository_attributes)

      safe_resolve &Repository.update_repository/2
    end

    field :upsert_repository, :repository do
      middleware Authenticated
      arg :attributes, non_null(:repository_attributes)
      arg :name,       non_null(:string)
      arg :publisher,  non_null(:string)

      safe_resolve &Repository.upsert_repository/2
    end

    field :delete_repository, :repository do
      middleware Authenticated
      arg :repository_id, non_null(:id)

      safe_resolve &Repository.delete_repository/2
    end

    field :create_installation, :installation do
      middleware Authenticated
      arg :repository_id, non_null(:id)

      safe_resolve &Repository.create_installation/2
    end

    field :update_installation, :installation do
      middleware Authenticated
      arg :id, non_null(:id)
      arg :attributes, non_null(:installation_attributes)

      safe_resolve &Repository.update_installation/2
    end

    field :delete_installation, :installation do
      middleware Authenticated
      arg :id, non_null(:id)

      safe_resolve &Repository.delete_installation/2
    end

    field :reset_installations, :integer do
      middleware Authenticated

      safe_resolve &Repository.reset_installations/2
    end

    field :create_integration, :integration do
      middleware Authenticated
      arg :repository_name, non_null(:string)
      arg :attributes, non_null(:integration_attributes)

      safe_resolve &Repository.upsert_integration/2
    end

    field :create_artifact, :artifact do
      middleware Authenticated
      arg :repository_id,   :id
      arg :repository_name, :string
      arg :attributes, non_null(:artifact_attributes)

      safe_resolve &Repository.create_artifact/2
    end

    field :create_oidc_provider, :oidc_provider do
      middleware Authenticated, :external
      arg :installation_id, non_null(:id), description: "The installation ID"
      arg :attributes, non_null(:oidc_attributes)

      safe_resolve &Repository.create_oidc_provider/2
    end

    field :update_oidc_provider, :oidc_provider do
      middleware Authenticated, :external
      arg :installation_id, non_null(:id)
      arg :attributes, non_null(:oidc_attributes)

      safe_resolve &Repository.update_oidc_provider/2
    end

    field :upsert_oidc_provider, :oidc_provider do
      middleware Authenticated, :external
      arg :installation_id, non_null(:id)
      arg :attributes, non_null(:oidc_attributes)

      safe_resolve &Repository.upsert_oidc_provider/2
    end

    field :acquire_lock, :apply_lock do
      middleware Authenticated
      arg :repository, non_null(:string)

      safe_resolve &Repository.acquire_apply_lock/2
    end

    field :release_lock, :apply_lock do
      middleware Authenticated
      arg :repository, non_null(:string)
      arg :attributes, non_null(:lock_attributes)

      safe_resolve &Repository.release_apply_lock/2
    end
  end
end
