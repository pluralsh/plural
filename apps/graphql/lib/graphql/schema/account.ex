defmodule GraphQl.Schema.Account do
  use GraphQl.Schema.Base
  alias GraphQl.Middleware.Authenticated
  alias GraphQl.Resolvers.{Account, User}

  input_object :account_attributes do
    field :name, :string
  end

  input_object :invite_attributes do
    field :email, :string
  end

  input_object :group_attributes do
    field :name,  non_null(:string)
    field :description, :string
  end

  object :account do
    field :id,                  non_null(:id)
    field :name,                :string
    field :billing_customer_id, :string

    field :root_user, :user, resolve: dataloader(Account)

    field :background_color, :string, resolve: fn
      user, _, _ -> {:ok, User.background_color(user)}
    end

    timestamps()
  end

  object :invite do
    field :secure_id, non_null(:string)
    field :email, :string
  end

  object :group do
    field :id, non_null(:id)
    field :name, non_null(:string)
    field :description, :string

    timestamps()
  end

  object :group_member do
    field :id, non_null(:id)
    field :user, :user, resolve: dataloader(User)
    field :group, :group, resolve: dataloader(Account)

    timestamps()
  end

  connection node_type: :group
  connection node_type: :group_member

  object :account_queries do
    field :invite, :invite do
      arg :id, non_null(:string)

      resolve &Account.resolve_invite/2
    end

    connection field :groups, node_type: :group  do
      middleware Authenticated
      arg :q, :string

      resolve &Account.list_groups/2
    end

    connection field :group_members, node_type: :group_member  do
      middleware Authenticated
      arg :group_id, non_null(:id)

      resolve &Account.list_group_members/2
    end
  end

  object :account_mutations do
    field :update_account, :account do
      middleware Authenticated
      arg :attributes, non_null(:account_attributes)

      resolve safe_resolver(&Account.update_account/2)
    end

    field :create_invite, :invite do
      arg :attributes, non_null(:invite_attributes)

      resolve safe_resolver(&Account.create_invite/2)
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
  end
end