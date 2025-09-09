defmodule GraphQl.Schema.Account do
  use GraphQl.Schema.Base
  alias GraphQl.Middleware.Limited
  alias GraphQl.Resolvers.{Account, User, Payments}

  enum_from_list :permission, Core.Schema.Role, :permissions, []
  ecto_enum :webhook_log_state, Core.Schema.WebhookLog.State
  ecto_enum :oauth_service, Core.Schema.OAuthIntegration.Service

  input_object :account_attributes do
    field :name,            :string
    field :icon,            :upload_or_url
    field :domain_mappings, list_of(:domain_mapping_input)
    field :billing_address, :address_attributes
  end

  input_object :domain_mapping_input do
    field :id,         :id
    field :domain,     :string
    field :enable_sso, :boolean
  end

  input_object :invite_attributes do
    field :email,              :string
    field :admin,              :boolean
    field :oidc_provider_id,   :id
    field :service_account_id, :id
    field :invite_groups,      list_of(:binding_attributes)
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
    field :cluster_count,        :string
    field :user_count,           :string
    field :delinquent_at,        :datetime
    field :grandfathered_until,  :datetime
    field :billing_address,      :address
    field :trialed,              :boolean

    field :consumer_email_domains, list_of(:string), resolve: fn
      _, _, _ -> {:ok, Core.Schema.DomainMapping.restricted()}
    end

    field :icon, :string, resolve: fn
      account, _, _ -> {:ok, Core.Storage.url({account.icon, account}, :original)}
    end

    connection field :payment_methods, node_type: :payment_method do
      resolve &Payments.list_payment_methods/3
    end

    field :root_user, :user, resolve: dataloader(User)
    field :domain_mappings, list_of(:domain_mapping), resolve: dataloader(Account)
    field :subscription, :platform_subscription, resolve: dataloader(Payments)

    field :background_color, :string, resolve: fn
      user, _, _ -> {:ok, User.background_color(user)}
    end

    field :available_features, :plan_features, resolve: fn
      account, _, _ -> {:ok, Account.available_features(account)}
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
    field :admin,     :boolean
    field :secure_id, :string, resolve: fn
      %{user_id: id}, _, _ when is_binary(id) -> {:ok, nil} # obfuscate for existing users
      %{secure_id: id}, _, _ -> {:ok, id}
    end

    field :existing,  non_null(:boolean), resolve: fn
      %{user_id: id}, _, _ when is_binary(id) -> {:ok, true}
      _, _, _ -> {:ok, false}
    end
    field :email,     :string
    field :expires_at, :datetime, resolve: fn
      %{inserted_at: at}, _, _ -> {:ok, Timex.shift(at, days: 2)}
    end

    field :account, :account, resolve: dataloader(Account)
    field :user,    :user, resolve: dataloader(User)
    field :groups,  list_of(:group), resolve: dataloader(Account)

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
    field :account, :account do
      middleware Authenticated, :external

      resolve &Account.resolve_account/2
    end

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

      safe_resolve &Account.resolve_role/2
    end

    connection field :roles, node_type: :role do
      middleware Authenticated
      arg :q,       :string
      arg :user_id, :id

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

    field :license_key, :string do
      middleware Authenticated

      resolve &Account.license_key/2
    end
  end

  object :account_mutations do
    field :create_service_account, :user do
      middleware Authenticated
      middleware Differentiate, feature: :user_management
      arg :attributes, non_null(:service_account_attributes)

      safe_resolve &Account.create_service_account/2
    end

    field :update_service_account, :user do
      middleware Authenticated
      arg :id, non_null(:id)
      arg :attributes, non_null(:service_account_attributes)

      safe_resolve &Account.update_service_account/2
    end

    field :impersonate_service_account, :user do
      middleware Authenticated
      middleware GraphQl.Middleware.AllowJwt
      arg :id,    :id
      arg :email, :string

      safe_resolve &Account.impersonate_service_account/2
    end

    field :update_account, :account do
      middleware Authenticated
      arg :attributes, non_null(:account_attributes)

      safe_resolve &Account.update_account/2
    end

    field :create_invite, :invite do
      middleware Authenticated
      middleware Limited, limit: :user
      arg :attributes, non_null(:invite_attributes)

      safe_resolve &Account.create_invite/2
    end

    field :delete_invite, :invite do
      arg :id, :id
      arg :secure_id, :string

      safe_resolve &Account.delete_invite/2
    end

    field :realize_invite, :user do
      arg :id, non_null(:string)

      safe_resolve &Account.realize_invite/2
    end

    field :create_group, :group do
      middleware Authenticated
      middleware Differentiate, feature: :user_management
      arg :attributes, non_null(:group_attributes)

      safe_resolve &Account.create_group/2
    end

    field :delete_group, :group do
      middleware Authenticated
      arg :group_id, non_null(:id)

      safe_resolve &Account.delete_group/2
    end

    field :update_group, :group do
      middleware Authenticated
      arg :group_id, non_null(:id)
      arg :attributes, non_null(:group_attributes)

      safe_resolve &Account.update_group/2
    end

    field :create_group_member, :group_member do
      middleware Authenticated
      arg :group_id, non_null(:id)
      arg :user_id, non_null(:id)

      safe_resolve &Account.create_group_member/2
    end

    field :delete_group_member, :group_member do
      middleware Authenticated
      arg :group_id, non_null(:id)
      arg :user_id, non_null(:id)

      safe_resolve &Account.delete_group_member/2
    end

    field :create_role, :role do
      middleware Authenticated
      middleware Differentiate, feature: :user_management
      arg :attributes, non_null(:role_attributes)

      safe_resolve &Account.create_role/2
    end

    field :update_role, :role do
      middleware Authenticated
      arg :id, non_null(:id)
      arg :attributes, non_null(:role_attributes)

      safe_resolve &Account.update_role/2
    end

    field :delete_role, :role do
      middleware Authenticated
      arg :id, non_null(:id)

      safe_resolve &Account.delete_role/2
    end

    field :create_integration_webhook, :integration_webhook do
      middleware Authenticated
      arg :attributes, non_null(:integration_webhook_attributes)

      safe_resolve &Account.create_webhook/2
    end

    field :update_integration_webhook, :integration_webhook do
      middleware Authenticated
      arg :id, non_null(:id)
      arg :attributes, non_null(:integration_webhook_attributes)

      safe_resolve &Account.update_webhook/2
    end

    field :delete_integration_webhook, :integration_webhook do
      middleware Authenticated
      arg :id, non_null(:id)

      safe_resolve &Account.delete_webhook/2
    end

    field :create_oauth_integration, :oauth_integration do
      middleware Authenticated
      arg :attributes, non_null(:oauth_attributes)

      safe_resolve &Account.create_integration/2
    end

    field :create_zoom, :zoom_meeting do
      middleware Authenticated, :external
      arg :attributes, non_null(:meeting_attributes)

      safe_resolve &Account.create_zoom_meeting/2
    end
  end
end
