defmodule GraphQl.Schema.User do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{
    User,
    Payments,
    Account
  }
  alias GraphQl.Middleware.Authenticated

  ecto_enum :notification_type, Core.Schema.Notification.Type
  ecto_enum :reset_token_type, Core.Schema.ResetToken.Type

  input_object :user_attributes do
    field :name,     :string
    field :email,    :string
    field :password, :string
    field :avatar,   :upload_or_url
  end

  input_object :publisher_attributes do
    field :name,        :string
    field :description, :string
    field :avatar,      :upload_or_url
    field :phone,       :string
    field :address,     :address_attributes
  end

  input_object :address_attributes do
    field :line1,   non_null(:string)
    field :line2,   non_null(:string)
    field :city,    non_null(:string)
    field :state,   non_null(:string)
    field :country, non_null(:string)
    field :zip,     non_null(:string)
  end

  input_object :webhook_attributes do
    field :url, non_null(:string)
  end

  input_object :reset_token_attributes do
    field :type,  non_null(:reset_token_type)
    field :email, :string
  end

  input_object :reset_token_realization do
    field :password, :string
  end

  input_object :public_key_attributes do
    field :name,    non_null(:string)
    field :content, non_null(:string)
  end

  object :user do
    field :id,               non_null(:id)
    field :name,             non_null(:string)
    field :email,            non_null(:string)
    field :phone,            :string
    field :address,          :address
    field :default_queue_id, :id
    field :service_account,  :boolean

    field :publisher,            :publisher, resolve: dataloader(User)
    field :account,              :account, resolve: dataloader(Account)
    field :impersonation_policy, :impersonation_policy, resolve: dataloader(User)

    field :jwt, :string, resolve: fn
      %{jwt: jwt}, _, %{context: %{allow_jwt: true}} -> {:ok, jwt}
      _, _, _ -> {:error, "forbidden"}
    end

    field :avatar, :string, resolve: fn
      user, _, _ -> {:ok, Core.Storage.url({user.avatar, user}, :original)}
    end

    field :background_color, :string, resolve: fn
      user, _, _ -> {:ok, User.background_color(user)}
    end

    connection field :cards, node_type: :card do
      resolve &Payments.list_cards/3
    end

    timestamps()
  end

  object :impersonation_policy do
    field :id, non_null(:id)
    field :bindings, list_of(:impersonation_policy_binding), resolve: dataloader(User)

    timestamps()
  end

  object :impersonation_policy_binding do
    field :id,    non_null(:id)
    field :user,  :user, resolve: dataloader(User)
    field :group, :group, resolve: dataloader(Account)

    timestamps()
  end

  object :address do
    field :line1,   :string
    field :line2,   :string
    field :city,    :string
    field :state,   :string
    field :country, :string
    field :zip,     :string
  end

  object :persisted_token do
    field :id,    :id
    field :token, :string

    timestamps()
  end

  object :publisher do
    field :id,                 :id
    field :name,               non_null(:string)
    field :description,        :string
    field :billing_account_id, :string
    field :phone,              :string
    field :address,            :address

    field :owner,  :user, resolve: dataloader(User)

    field :avatar, :string, resolve: fn
      publisher, _, _ -> {:ok, Core.Storage.url({publisher.avatar, publisher}, :original)}
    end

    field :background_color, :string, resolve: fn
      publisher, _, _ -> {:ok, User.background_color(publisher)}
    end

    field :repositories, list_of(:repository) do
      resolve fn publisher, _, %{context: %{loader: loader}} ->
        manual_dataloader(
          loader, User, {:many, Core.Schema.Publisher}, repositories: publisher)
      end
    end

    timestamps()
  end

  object :webhook do
    field :id,     :id
    field :url,    :string
    field :secret, :string
    field :user,   :user, resolve: dataloader(User)

    timestamps()
  end

  object :webhook_response do
    field :status_code, non_null(:integer)
    field :body,        :string
    field :headers,     :map
  end

  object :reset_token do
    field :id,          non_null(:id)
    field :external_id, non_null(:id)
    field :type,        non_null(:reset_token_type)
    field :user,        non_null(:user), resolve: dataloader(User)
    field :email,       non_null(:string)

    timestamps()
  end

  object :public_key do
    field :id,      non_null(:id)
    field :name,    non_null(:string)
    field :content, non_null(:string)
    field :digest,  non_null(:string)
    field :user,    non_null(:user), resolve: dataloader(User)

    timestamps()
  end

  connection node_type: :user
  connection node_type: :publisher
  connection node_type: :webhook
  connection node_type: :persisted_token
  connection node_type: :public_key

  object :user_queries do
    field :me, :user do
      middleware Authenticated, :external
      resolve fn _, %{context: %{current_user: user}} -> {:ok, user} end
    end

    field :reset_token, :reset_token do
      arg :id, non_null(:id)
      resolve &User.resolve_reset_token/2
    end

    connection field :tokens, node_type: :persisted_token do
      middleware Authenticated
      resolve &User.list_tokens/2
    end

    field :publisher, :publisher do
      middleware Authenticated
      arg :id, :id

      resolve &User.resolve_publisher/2
    end

    connection field :users, node_type: :user do
      middleware Authenticated
      arg :q, :string
      arg :service_account, :boolean
      arg :all, :boolean

      resolve &User.list_users/2
    end

    connection field :search_users, node_type: :user do
      middleware Authenticated
      arg :incident_id, non_null(:id)
      arg :q,           non_null(:string)

      resolve &User.search_users/2
    end

    connection field :publishers, node_type: :publisher do
      middleware Authenticated
      arg :account_id, :id

      resolve &User.list_publishers/2
    end

    connection field :webhooks, node_type: :webhook do
      middleware Authenticated

      resolve &User.list_webhooks/2
    end

    connection field :public_keys, node_type: :public_key do
      middleware Authenticated
      arg :emails, list_of(:string)

      resolve &User.list_keys/2
    end
  end

  object :user_mutations do
    field :login, :user do
      middleware GraphQl.Middleware.AllowJwt
      arg :email, non_null(:string)
      arg :password, non_null(:string)

      resolve safe_resolver(&User.login_user/2)
    end

    field :external_token, :string do
      middleware Authenticated
      resolve fn _, %{context: %{current_user: user}} ->
        {:ok, token, _} = Core.Guardian.encode_and_sign(user, %{"external" => true})
        {:ok, token}
      end
    end

    field :create_reset_token, :boolean do
      arg :attributes, non_null(:reset_token_attributes)
      resolve safe_resolver(&User.create_reset_token/2)
    end

    field :realize_reset_token, :boolean do
      arg :id, non_null(:id)
      arg :attributes, non_null(:reset_token_realization)

      resolve safe_resolver(&User.realize_reset_token/2)
    end

    field :create_token, :persisted_token do
      middleware Authenticated
      resolve safe_resolver(&User.create_token/2)
    end

    field :delete_token, :persisted_token do
      middleware Authenticated
      arg :id, non_null(:id)

      resolve safe_resolver(&User.delete_token/2)
    end

    field :signup, :user do
      middleware GraphQl.Middleware.AllowJwt
      arg :invite_id,  :string
      arg :attributes, non_null(:user_attributes)

      resolve safe_resolver(&User.signup_user/2)
    end

    field :update_user, :user do
      middleware Authenticated
      arg :attributes, non_null(:user_attributes)

      resolve safe_resolver(&User.update_user/2)
    end

    field :create_publisher, :publisher do
      middleware Authenticated
      arg :attributes, non_null(:publisher_attributes)

      resolve safe_resolver(&User.create_publisher/2)
    end

    field :create_webhook, :webhook do
      middleware Authenticated
      arg :attributes, non_null(:webhook_attributes)

      resolve safe_resolver(&User.create_webhook/2)
    end

    field :ping_webhook, :webhook_response do
      middleware Authenticated
      arg :id,   non_null(:id)
      arg :repo, non_null(:string)
      arg :message, :string

      resolve safe_resolver(&User.ping_webhook/2)
    end

    field :update_publisher, :publisher do
      middleware Authenticated
      arg :attributes, non_null(:publisher_attributes)

      resolve safe_resolver(&User.update_publisher/2)
    end

    field :create_public_key, :public_key do
      middleware Authenticated
      arg :attributes, non_null(:public_key_attributes)

      resolve safe_resolver(&User.create_public_key/2)
    end

    field :delete_public_key, :public_key do
      middleware Authenticated
      arg :id, non_null(:id)

      resolve safe_resolver(&User.delete_public_key/2)
    end
  end
end
