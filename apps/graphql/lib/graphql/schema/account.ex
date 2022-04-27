defmodule GraphQl.Schema.Account do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{Account, User}

  enum_from_list :permission, Core.Schema.Role, :permissions, []
  ecto_enum :webhook_log_state, Core.Schema.WebhookLog.State
  ecto_enum :oauth_service, Core.Schema.OAuthIntegration.Service

  input_object :account_attributes do
    field :name, :string
    field :icon, :upload_or_url
    field :domain_mappings, list_of(:domain_mapping_input)
  end

  input_object :domain_mapping_input do
    field :domain,     :string
    field :enable_sso, :boolean
  end

  input_object :invite_attributes do
    field :email, :string
  end

  input_object :group_attributes do
    field :name,        non_null(:string)
    field :description, :string
    field :global,      :boolean
  end

  input_object :role_attributes do
    field :name,  :string
    field :description, :string
    field :repositories, list_of(:string)
    field :role_bindings, list_of(:binding_attributes)
    field :permissions, list_of(:permission)
  end

  input_object :service_account_attributes do
    field :name,  :string
    field :email, :string
    field :impersonation_policy, :impersonation_policy_attributes
  end

  input_object :binding_attributes do
    field :id,       :id
    field :user_id,  :id
    field :group_id, :id
  end

  input_object :impersonation_policy_attributes do
    field :id,       :id
    field :bindings, list_of(:impersonation_policy_binding_attributes)
  end

  input_object :impersonation_policy_binding_attributes do
    field :id,       :id
    field :user_id,  :id
    field :group_id, :id
  end

  input_object :integration_webhook_attributes do
    field :name, non_null(:string)
    field :url,  non_null(:string)
    field :actions, list_of(:string)
  end

  input_object :oauth_attributes do
    field :service,      :oauth_service
    field :code,         :string
    field :redirect_uri, :string
  end

  input_object :meeting_attributes do
    field :topic,       non_null(:string)
    field :incident_id, :id
  end

  object :account do
    field :id,                   non_null(:id)
    field :name,                 :string
    field :billing_customer_id,  :string
    field :workos_connection_id, :string

    field :icon, :string, resolve: fn
      account, _, _ -> {:ok, Core.Storage.url({account.icon, account}, :original)}
    end

    field :root_user, :user, resolve: dataloader(User)
    field :domain_mappings, list_of(:domain_mapping), resolve: dataloader(Account)

    field :background_color, :string, resolve: fn
      user, _, _ -> {:ok, User.background_color(user)}
    end

    timestamps()
  end

  object :domain_mapping do
    field :id,         non_null(:id)
    field :domain,     non_null(:string)
    field :enable_sso, :boolean
    field :account,    :account, resolve: dataloader(Account)

    timestamps()
  end

  object :invite do
    field :id,        non_null(:id)
    field :secure_id, non_null(:string)
    field :email,     :string

    field :account, :account, resolve: dataloader(Account)
    field :user,    :user, resolve: dataloader(User)

    timestamps()
  end

  object :group do
    field :id,          non_null(:id)
    field :name,        non_null(:string)
    field :global,      :boolean
    field :description, :string

    timestamps()
  end

  object :group_member do
    field :id, non_null(:id)
    field :user, :user, resolve: dataloader(User)
    field :group, :group, resolve: dataloader(Account)

    timestamps()
  end

  object :role do
    field :id,           non_null(:id)
    field :name,         non_null(:string)
    field :description,  :string
    field :repositories, list_of(:string)
    field :permissions,  list_of(:permission), resolve: fn role, _, _ ->
      {:ok, Core.Schema.Role.permissions(role)}
    end
    field :role_bindings, list_of(:role_binding), resolve: dataloader(Account)
    field :account, :account, resolve: dataloader(Account)

    timestamps()
  end

  object :role_binding do
    field :id,    non_null(:id)
    field :user,  :user, resolve: dataloader(User)
    field :group, :group, resolve: dataloader(Account)

    timestamps()
  end

  object :integration_webhook do
    field :id,      non_null(:id)
    field :name,    non_null(:string)
    field :url,     non_null(:string)
    field :actions, list_of(:string)
    field :secret,  non_null(:string)

    field :account, :account, resolve: dataloader(Account)

    connection field :logs, node_type: :webhook_log do
      resolve &Account.list_webhook_logs/2
    end

    timestamps()
  end

  object :webhook_log do
    field :id,       non_null(:id)
    field :state,    non_null(:webhook_log_state)
    field :status,   :integer
    field :response, :string
    field :payload,  :map

    field :webhook, :integration_webhook, resolve: dataloader(Account)

    timestamps()
  end

  object :oauth_integration do
    field :id,      non_null(:id)
    field :service, non_null(:oauth_service)

    field :account, :account, resolve: dataloader(Account)

    timestamps()
  end

  object :zoom_meeting do
    field :join_url, non_null(:string)
    field :password, :string
  end

  connection node_type: :group
  connection node_type: :group_member
  connection node_type: :role
  connection node_type: :integration_webhook
  connection node_type: :webhook_log
  connection node_type: :invite

  object :account_queries do
    field :invite, :invite do
      arg :id, non_null(:string)

      resolve &Account.resolve_invite/2
    end

    connection field :invites, node_type: :invite do
      resolve &Account.list_invites/2
    end

    connection field :groups, node_type: :group  do
      middleware Authenticated, :external
      arg :q, :string

      resolve &Account.list_groups/2
    end

    connection field :group_members, node_type: :group_member  do
      middleware Authenticated
      arg :group_id, non_null(:id)

      resolve &Account.list_group_members/2
    end

    field :role, :role do
      middleware Authenticated
      arg :id, non_null(:id)

      resolve safe_resolver(&Account.resolve_role/2)
    end

    connection field :roles, node_type: :role do
      middleware Authenticated
      arg :q, :string

      resolve &Account.list_roles/2
    end

    connection field :integration_webhooks, node_type: :integration_webhook do
      middleware Authenticated

      resolve &Account.list_webhooks/2
    end

    field :integration_webhook, :integration_webhook do
      middleware Authenticated
      arg :id, non_null(:id)

      resolve &Account.resolve_webhook/2
    end

    field :oauth_integrations, list_of(:oauth_integration) do
      middleware Authenticated

      resolve &Account.list_oauth_integrations/2
    end
  end

  object :account_mutations do
    field :create_service_account, :user do
      middleware Authenticated
      arg :attributes, non_null(:service_account_attributes)

      resolve safe_resolver(&Account.create_service_account/2)
    end

    field :update_service_account, :user do
      middleware Authenticated
      arg :id, non_null(:id)
      arg :attributes, non_null(:service_account_attributes)

      resolve safe_resolver(&Account.update_service_account/2)
    end

    field :impersonate_service_account, :user do
      middleware Authenticated
      middleware GraphQl.Middleware.AllowJwt
      arg :id,    :id
      arg :email, :string

      resolve safe_resolver(&Account.impersonate_service_account/2)
    end

    field :update_account, :account do
      middleware Authenticated
      arg :attributes, non_null(:account_attributes)

      resolve safe_resolver(&Account.update_account/2)
    end

    field :create_invite, :invite do
      arg :attributes, non_null(:invite_attributes)

      resolve safe_resolver(&Account.create_invite/2)
    end

    field :delete_invite, :invite do
      arg :secure_id, non_null(:string)

      resolve safe_resolver(&Account.delete_invite/2)
    end

    field :realize_invite, :user do
      arg :id, non_null(:string)

      safe_resolve &Account.realize_invite/2
    end

    field :create_group, :group do
      middleware Authenticated
      arg :attributes, non_null(:group_attributes)

      resolve safe_resolver(&Account.create_group/2)
    end

    field :delete_group, :group do
      middleware Authenticated
      arg :group_id, non_null(:id)

      resolve safe_resolver(&Account.delete_group/2)
    end

    field :update_group, :group do
      middleware Authenticated
      arg :group_id, non_null(:id)
      arg :attributes, non_null(:group_attributes)

      resolve safe_resolver(&Account.update_group/2)
    end

    field :create_group_member, :group_member do
      middleware Authenticated
      arg :group_id, non_null(:id)
      arg :user_id, non_null(:id)

      resolve safe_resolver(&Account.create_group_member/2)
    end

    field :delete_group_member, :group_member do
      middleware Authenticated
      arg :group_id, non_null(:id)
      arg :user_id, non_null(:id)

      resolve safe_resolver(&Account.delete_group_member/2)
    end

    field :create_role, :role do
      middleware Authenticated
      arg :attributes, non_null(:role_attributes)

      resolve safe_resolver(&Account.create_role/2)
    end

    field :update_role, :role do
      middleware Authenticated
      arg :id, non_null(:id)
      arg :attributes, non_null(:role_attributes)

      resolve safe_resolver(&Account.update_role/2)
    end

    field :delete_role, :role do
      middleware Authenticated
      arg :id, non_null(:id)

      resolve safe_resolver(&Account.delete_role/2)
    end

    field :create_integration_webhook, :integration_webhook do
      middleware Authenticated
      arg :attributes, non_null(:integration_webhook_attributes)

      resolve safe_resolver(&Account.create_webhook/2)
    end

    field :update_integration_webhook, :integration_webhook do
      middleware Authenticated
      arg :id, non_null(:id)
      arg :attributes, non_null(:integration_webhook_attributes)

      resolve safe_resolver(&Account.update_webhook/2)
    end

    field :delete_integration_webhook, :integration_webhook do
      middleware Authenticated
      arg :id, non_null(:id)

      resolve safe_resolver(&Account.delete_webhook/2)
    end

    field :create_oauth_integration, :oauth_integration do
      middleware Authenticated
      arg :attributes, non_null(:oauth_attributes)

      resolve safe_resolver(&Account.create_integration/2)
    end

    field :create_zoom, :zoom_meeting do
      middleware Authenticated, :external
      arg :attributes, non_null(:meeting_attributes)

      resolve safe_resolver(&Account.create_zoom_meeting/2)
    end
  end
end
