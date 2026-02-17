defmodule GraphQl.Schema.Payments do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{
    Payments,
    Repository
  }

  ecto_enum :plan_type, Core.Schema.Plan.Type
  ecto_enum :payment_period, Core.Schema.PlatformPlan.Period
  ecto_enum :line_item_dimension, Core.Schema.PlatformPlan.Dimension

  ### INPUTS

  input_object :plan_attributes do
    field :name,       non_null(:string)
    field :cost,       non_null(:integer)
    field :period,     non_null(:string)
    field :default,    :boolean
    field :line_items, :plan_line_item_attributes
    field :metadata,   :plan_metadata_attributes
    field :service_levels, list_of(:service_level_attributes)
  end

  input_object :updatable_plan_attributes do
    field :default,        :boolean
    field :service_levels, list_of(:service_level_attributes)
  end

  input_object :service_level_attributes do
    field :max_severity,  :integer
    field :min_severity,  :integer
    field :response_time, :integer
  end

  input_object :plan_metadata_attributes do
    field :freeform, :yml
    field :features, list_of(:plan_feature_attributes)
  end

  input_object :plan_feature_attributes do
    field :name,        non_null(:string)
    field :description, non_null(:string)
  end

  input_object :plan_line_item_attributes do
    field :included, list_of(:limit_attributes)
    field :items,    list_of(:line_item_attributes)
  end

  input_object :limit_attributes do
    field :dimension, non_null(:string)
    field :quantity,  non_null(:integer)
  end

  input_object :line_item_attributes do
    field :name,      non_null(:string)
    field :dimension, non_null(:string)
    field :cost,      non_null(:integer)
    field :period,    non_null(:string)
    field :type,      :plan_type
  end

  input_object :subscription_attributes do
    field :line_items, :subscription_line_item_attributes
  end

  input_object :subscription_line_item_attributes do
    field :items, list_of(:limit_attributes)
  end

  input_object :platform_plan_line_item_attributes do
    field :dimension, non_null(:line_item_dimension)
    field :quantity,  non_null(:integer)
  end

  ### OBJECTS

  object :plan do
    field :id,             non_null(:id)
    field :name,           non_null(:string)
    field :default,        :boolean
    field :visible,        non_null(:boolean)
    field :cost,           non_null(:integer)
    field :period,         :string
    field :line_items,     :plan_line_items
    field :metadata,       :plan_metadata
    field :service_levels, list_of(:service_level)

    timestamps()
  end

  object :platform_plan do
    field :id,               non_null(:id)
    field :name,             non_null(:string)
    field :visible,          non_null(:boolean)
    field :cost,             non_null(:integer)
    field :period,           non_null(:payment_period)
    field :enterprise,       :boolean
    field :trial,            :boolean
    field :features,         :plan_features
    field :maximum_users,    :integer
    field :maximum_clusters, :integer
    field :line_items,       list_of(:platform_plan_item)

    timestamps()
  end

  object :platform_plan_item do
    field :name,        non_null(:string)
    field :dimension,   non_null(:line_item_dimension)
    field :external_id, :string
    field :cost,        non_null(:integer)
    field :period,      non_null(:payment_period)
  end

  object :plan_features do
    field :vpn,                 :boolean
    field :user_management,     :boolean
    field :audit,               :boolean
    field :database_management, :boolean
    field :cd,                  :boolean
  end

  object :service_level do
    field :max_severity,  :integer
    field :min_severity,  :integer
    field :response_time, :integer
  end

  object :invoice do
    field :number,             non_null(:string)
    field :amount_due,         non_null(:integer)
    field :amount_paid,        non_null(:integer)
    field :currency,           non_null(:string)
    field :status,             :string
    field :hosted_invoice_url, :string
    field :payment_intent,     :payment_intent
    field :created_at,  :datetime, resolve: fn %{created: created}, _, _ ->
      {:ok, Timex.from_unix(created)}
    end
    field :lines, list_of(:invoice_item), resolve: fn
      %Stripe.Invoice{lines: %Stripe.List{data: lines}}, _, _ -> {:ok, lines}
    end
  end

  object :payment_method do
    field :id,   :string
    field :card, :card
    field :type, :string

    field :is_default, :boolean, resolve: fn
      %Stripe.PaymentMethod{id: id, customer: %Stripe.Customer{invoice_settings: %{default_payment_method: id}}}, _, _ ->
        {:ok, true}
      _, _, _ -> {:ok, false}
    end
  end

  object :payment_intent do
    field :id,             :string
    field :description,    :string
    field :client_secret,  :string
    field :amount,         :integer
    field :capture_method, :string
    field :currency,       :string
    field :next_action,    :next_action
    field :status,         :string
  end

  object :setup_intent do
    field :id,                   :string
    field :client_secret,        :string
    field :next_action,          :next_action
    field :payment_method_types, list_of(:string)
    field :status,               :string
  end

  object :next_action do
    field :type, :string
    field :redirect_to_url, :redirect_to_url
  end

  object :redirect_to_url do
    field :url,        :string
    field :return_url, :string
  end

  object :repository_subscription do
    field :id,           non_null(:id)
    field :external_id,  :string
    field :customer_id,  :string
    field :line_items,   :subscription_line_items
    field :installation, :installation, resolve: dataloader(Repository)
    field :plan,         :plan, resolve: dataloader(Payments)

    connection field :invoices, node_type: :invoice do
      resolve &Payments.list_invoices/3
    end
  end

  object :platform_subscription do
    field :id,             non_null(:id)
    field :external_id,    :string
    field :line_items,     list_of(:platform_subscription_line_items)
    field :plan,           :platform_plan, resolve: dataloader(Payments)

    field :trial_until,    :datetime, resolve: fn
      %{inserted_at: dt}, _, _ -> {:ok, Timex.shift(dt, months: 1)}
    end

    field :latest_invoice, :invoice, resolve: fn
      sub, _, _ -> Payments.latest_invoice(sub)
    end

    timestamps()
  end

  object :platform_subscription_line_items do
    field :dimension,   non_null(:line_item_dimension)
    field :quantity,    non_null(:integer)
    field :external_id, :string
  end

  object :card do
    field :id,         non_null(:id)
    field :last4,      non_null(:string)
    field :exp_month,  non_null(:integer)
    field :exp_year,   non_null(:integer)
    field :brand,      non_null(:string)
    field :name,       :string
  end

  object :invoice_item do
    field :amount,      non_null(:integer)
    field :currency,    non_null(:string)
    field :description, :string
  end

  object :plan_line_items do
    field :included, list_of(:limit)
    field :items,    list_of(:line_item)
  end

  object :plan_metadata do
    field :freeform, :map
    field :features, list_of(:plan_feature)
  end

  object :plan_feature do
    field :name,        non_null(:string)
    field :description, non_null(:string)
  end

  object :subscription_line_items do
    field :items, list_of(:limit)
  end

  object :line_item do
    field :name,      non_null(:string)
    field :dimension, non_null(:string)
    field :cost,      non_null(:integer)
    field :period,    :string
    field :type,      :plan_type
  end

  object :limit do
    field :dimension, non_null(:string)
    field :quantity,  non_null(:integer)
  end

  object :checkout_session do
    field :url, :string
  end

  connection node_type: :invoice
  connection node_type: :card
  connection node_type: :payment_method
  connection node_type: :repository_subscription

  object :payment_queries do
    field :repository_subscription, :repository_subscription do
      middleware Authenticated
      arg :id, non_null(:id)

      resolve &Payments.resolve_subscription/2
    end

    connection field :subscriptions, node_type: :repository_subscription do
      middleware Authenticated

      resolve &Payments.list_subscriptions/2
    end

    field :platform_plans, list_of(:platform_plan) do
      resolve &Payments.list_platform_plans/2
    end

    field :platform_subscription, :platform_subscription do
      middleware Authenticated

      resolve &Payments.resolve_platform_subscription/2
    end

    connection field :invoices, node_type: :invoice do
      resolve &Payments.list_invoices/2
    end
  end

  object :payment_mutations do
    field :create_card, :account do
      middleware Authenticated
      arg :source, non_null(:string)
      arg :address, :address_attributes

      safe_resolve &Payments.create_card/2
    end

    field :setup_intent, :setup_intent do
      middleware Authenticated
      arg :address, :address_attributes

      safe_resolve &Payments.setup_intent/2
    end

    field :default_payment_method, :boolean do
      middleware Authenticated
      arg :id, non_null(:string)

      safe_resolve &Payments.default_payment_method/2
    end

    field :delete_card, :account do
      middleware Authenticated
      arg :id, non_null(:id)

      safe_resolve &Payments.delete_card/2
    end

    field :delete_payment_method, :payment_method do
      middleware Authenticated
      arg :id, non_null(:id)

      safe_resolve &Payments.delete_payment_method/2
    end

    field :link_publisher, :publisher do
      middleware Authenticated
      arg :token, non_null(:string)

      safe_resolve &Payments.link_publisher/2
    end

    field :create_plan, :plan do
      middleware Authenticated
      arg :repository_id, non_null(:id)
      arg :attributes, non_null(:plan_attributes)

      safe_resolve &Payments.create_plan/2
    end

    field :update_plan_attributes, :plan do
      middleware Authenticated
      arg :attributes, non_null(:updatable_plan_attributes)
      arg :id,         non_null(:id)

      safe_resolve &Payments.update_plan_attributes/2
    end

    field :create_subscription, :repository_subscription do
      middleware Authenticated
      arg :installation_id, non_null(:id)
      arg :plan_id, non_null(:id)
      arg :attributes, :subscription_attributes

      safe_resolve &Payments.create_subscription/2
    end

    field :update_plan, :repository_subscription do
      middleware Authenticated
      arg :plan_id, non_null(:id)
      arg :subscription_id, non_null(:id)

      safe_resolve &Payments.update_plan/2
    end

    field :update_line_item, :repository_subscription do
      middleware Authenticated
      arg :attributes, non_null(:limit_attributes)
      arg :subscription_id, non_null(:id)

      safe_resolve &Payments.update_line_item/2
    end

    field :create_platform_subscription, :platform_subscription do
      middleware Authenticated
      arg :plan_id,         non_null(:id)
      arg :billing_address, :address_attributes
      arg :payment_method,  :string

      safe_resolve &Payments.create_platform_subscription/2
    end

    field :begin_trial, :platform_subscription do
      middleware Authenticated

      safe_resolve &Payments.begin_trial/2
    end

    field :initiate_checkout, :checkout_session do
      middleware Authenticated

      safe_resolve &Payments.initiate_checkout/2
    end

    field :finalize_checkout, :platform_subscription do
      middleware Authenticated
      arg :session_id, non_null(:string)

      safe_resolve &Payments.finalize_checkout/2
    end

    field :delete_platform_subscription, :account do
      middleware Authenticated

      safe_resolve &Payments.delete_platform_subscription/2
    end

    field :cancel_platform_subscription, :platform_subscription do
      middleware Authenticated

      safe_resolve &Payments.cancel_platform_subscription/2
    end

    field :update_platform_plan, :platform_subscription do
      middleware Authenticated
      arg :plan_id, non_null(:id)

      safe_resolve &Payments.update_platform_plan/2
    end
  end
end
