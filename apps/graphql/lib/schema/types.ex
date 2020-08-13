defmodule GraphQl.Schema.Types do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{
    User,
    Repository,
    Chart,
    Terraform,
    Docker,
    Recipe,
    Payments
  }

  object :user do
    field :id,          non_null(:id)
    field :name,        non_null(:string)
    field :email,       non_null(:string)
    field :customer_id, :string
    field :publisher,   :publisher, resolve: dataloader(User)
    field :phone,       :string
    field :address,     :address

    field :jwt, :string, resolve: fn
      %{id: id, jwt: jwt}, _, %{context: %{current_user: %{id: id}}} -> {:ok, jwt}
      _, _, %{context: %{current_user: %{}}} -> {:error, "you can only query your own jwt"}
      %{jwt: jwt}, _, _ -> {:ok, jwt}
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
    field :id,           :id
    field :name,         non_null(:string)
    field :description,  :string
    field :account_id,   :string
    field :owner,        :user, resolve: dataloader(User)
    field :phone,        :string
    field :address,      :address

    field :avatar, :string, resolve: fn
      publisher, _, _ -> {:ok, Core.Storage.url({publisher.avatar, publisher}, :original)}
    end

    field :repositories, list_of(:repository) do
      resolve fn publisher, _, %{context: %{loader: loader}} ->
        manual_dataloader(
          loader, User, {:many, Core.Schema.Publisher}, repositories: publisher)
      end
    end

    timestamps()
  end

  object :repository do
    field :id,            :id
    field :name,          non_null(:string)
    field :description,   :string
    field :documentation, :string
    field :publisher,     :publisher, resolve: dataloader(User)
    field :plans,         list_of(:plan), resolve: dataloader(Payments)
    field :tags,          list_of(:tag), resolve: dataloader(Repository)
    field :artifacts,     list_of(:artifact), resolve: dataloader(Repository)
    field :dashboards,    list_of(:dashboard), resolve: dataloader(Repository)
    field :shell,         :shell, resolve: dataloader(Repository)
    field :database,      :database, resolve: dataloader(Repository)

    field :icon, :string, resolve: fn
      repo, _, _ -> {:ok, Core.Storage.url({repo.icon, repo}, :original)}
    end

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

  object :dashboard do
    field :id,   non_null(:id)
    field :name, non_null(:string)
    field :uid,  non_null(:string)

    timestamps()
  end

  enum :engine do
    value :postgres
  end

  object :database do
    field :id,          non_null(:id)
    field :engine,      non_null(:engine)
    field :target,      non_null(:string)
    field :port,        non_null(:integer)
    field :name,        non_null(:string)
    field :credentials, :credentials

    timestamps()
  end

  object :credentials do
    field :user,   non_null(:string)
    field :secret, non_null(:string)
    field :key,    non_null(:string)
  end

  object :shell do
    field :id,      non_null(:id)
    field :target,  non_null(:string)
    field :command, :string
    field :args,    list_of(:string)

    timestamps()
  end

  object :chart do
    field :id,             :id
    field :name,           non_null(:string)
    field :description,    :string
    field :latest_version, :string
    field :repository,     :repository, resolve: dataloader(Repository)
    field :dependencies,   :dependencies

    field :installation, :chart_installation, resolve: fn
      chart, _, %{context: %{current_user: user}} ->
        Chart.resolve_chart_installation(chart, user)
    end

    timestamps()
  end

  object :version do
    field :id,              :id
    field :version,         non_null(:string)
    field :readme,          :string
    field :values_template, :string
    field :helm,            :map

    field :chart, :chart, resolve: dataloader(Chart)

    timestamps()
  end

  object :installation do
    field :id,           :id
    field :context,      :map
    field :auto_upgrade, :boolean
    field :repository,   :repository, resolve: dataloader(Repository)
    field :user,         :user, resolve: dataloader(User)
    field :subscription, :repository_subscription, resolve: dataloader(Payments)

    field :license, :string, resolve: fn
      installation, _, _ -> Core.Services.Repositories.generate_license(installation)
    end

    timestamps()
  end

  object :chart_installation do
    field :id,           :id
    field :chart,        :chart, resolve: dataloader(Chart)
    field :version,      :version, resolve: dataloader(Chart)
    field :installation, :installation, resolve: dataloader(Repository)

    timestamps()
  end

  object :terraform_installation do
    field :id,           :id
    field :terraform,    :terraform, resolve: dataloader(Terraform)
    field :installation, :installation, resolve: dataloader(Repository)

    timestamps()
  end

  object :docker_repository do
    field :id,         :id
    field :name,       :string
    field :repository, :repository, resolve: dataloader(Repository)

    timestamps()
  end

  object :docker_image do
    field :id,     :id
    field :tag,    :string
    field :digest, :string

    field :docker_repository, :docker_repository, resolve: dataloader(Docker)

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
    field :blob, :string, resolve: fn
      artifact, _, _ -> {:ok, Core.Storage.url({artifact.blob, artifact}, :original)}
    end

    timestamps()
  end

  enum :artifact_type do
    value :cli
    value :mobile
    value :desktop
  end

  enum :artifact_platform do
    value :mac
    value :windows
    value :linux
  end

  object :dependencies do
    field :dependencies, list_of(:dependency)
    field :providers, list_of(:provider)
    field :wirings, :wirings
  end

  enum :dependency_type do
    value :terraform
    value :helm
  end

  object :dependency do
    field :type, :dependency_type
    field :name, :string
    field :repo, :string
  end

  object :closure do
    field :helm, list_of(:chart)
    field :terraform, list_of(:terraform)
  end

  object :wirings do
    field :terraform, :map
    field :helm, :map
  end

  object :webhook do
    field :id,     :id
    field :url,    :string
    field :secret, :string
    field :user,   :user, resolve: dataloader(User)

    timestamps()
  end

  object :terraform do
    field :id,              :id
    field :name,            :string
    field :readme,          :string
    field :description,     :string
    field :values_template, :string
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

  object :webhook_response do
    field :status_code, non_null(:integer)
    field :body,        :string
    field :headers,     :map
  end

  object :recipe do
    field :id,              :id
    field :name,            non_null(:string)
    field :description,     :string
    field :provider,        :provider
    field :repository,      :repository, resolve: dataloader(Repository)
    field :recipe_sections, list_of(:recipe_section)

    timestamps()
  end

  enum :provider do
    value :gcp
    value :aws
    value :azure
  end

  object :recipe_section do
    field :id,           :id
    field :repository,   :repository, resolve: dataloader(Repository)
    field :recipe,       :recipe, resolve: dataloader(Recipe)
    field :index,        :integer
    field :recipe_items, list_of(:recipe_item), resolve: dataloader(Recipe)

    timestamps()
  end

  object :recipe_item do
    field :id,             :id
    field :chart,          :chart, resolve: dataloader(Chart)
    field :terraform,      :terraform, resolve: dataloader(Terraform)
    field :recipe_section, :recipe_section, resolve: dataloader(Recipe)
    field :configuration,  list_of(:recipe_configuration)

    timestamps()
  end

  enum :datatype do
    value :int
    value :bool
    value :string
    value :object
  end

  object :recipe_configuration do
    field :type,          :datatype
    field :name,          :string
    field :default,       :string
    field :documentation, :string
    field :placeholder,   :string
  end

  object :integration do
    field :id,          non_null(:id)
    field :name,        non_null(:string)
    field :source_url,  :string
    field :description, :string
    field :spec,        :map

    field :icon, :string, resolve: fn
      integration, _, _ -> {:ok, Core.Storage.url({integration.icon, integration}, :original)}
    end

    field :repository, :repository, resolve: dataloader(Repository)
    field :publisher,  :publisher, resolve: dataloader(User)
    field :tags,       list_of(:tag), resolve: dataloader(Repository)

    timestamps()
  end

  object :plan do
    field :id,         non_null(:id)
    field :name,       non_null(:string)
    field :default,    :boolean
    field :visible,    non_null(:boolean)
    field :cost,       non_null(:integer)
    field :period,     :string
    field :line_items, :plan_line_items
    field :metadata,   :plan_metadata

    timestamps()
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

  object :invoice do
    field :number,             non_null(:string)
    field :amount_due,         non_null(:integer)
    field :amount_paid,        non_null(:integer)
    field :currency,           non_null(:string)
    field :status,             :string
    field :hosted_invoice_url, :string
    field :created_at,  :datetime, resolve: fn %{created: created}, _, _ ->
      {:ok, Timex.from_unix(created)}
    end
    field :lines, list_of(:invoice_item), resolve: fn
      %Stripe.Invoice{lines: %Stripe.List{data: lines}}, _, _ -> {:ok, lines}
    end
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

  object :tag do
    field :id,  non_null(:id)
    field :tag, non_null(:string)
  end

  enum :tag_group do
    value :integrations
    value :repositories
  end

  object :grouped_tag do
    field :tag,   non_null(:string)
    field :count, non_null(:integer)
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
  end

  object :limit do
    field :dimension, non_null(:string)
    field :quantity,  non_null(:integer)
  end

  connection node_type: :user
  connection node_type: :publisher
  connection node_type: :repository
  connection node_type: :chart
  connection node_type: :version
  connection node_type: :installation
  connection node_type: :integration
  connection node_type: :terraform
  connection node_type: :terraform_installation
  connection node_type: :chart_installation
  connection node_type: :persisted_token
  connection node_type: :docker_repository
  connection node_type: :docker_image
  connection node_type: :webhook
  connection node_type: :recipe
  connection node_type: :grouped_tag
  connection node_type: :repository_subscription
  connection node_type: :invoice
  connection node_type: :card
end