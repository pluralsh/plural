defmodule GraphQl.Schema.Types do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{
    User,
    Repository,
    Chart,
    Terraform,
    Docker,
    Recipe
  }

  object :user do
    field :id,        :id
    field :name,      non_null(:string)
    field :email,     non_null(:string)
    field :publisher, :publisher, resolve: dataloader(User)

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

    timestamps()
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
    field :owner,        :user, resolve: dataloader(User)

    field :avatar, :string, resolve: fn
      publisher, _, _ -> {:ok, Core.Storage.url({publisher.avatar, publisher}, :original)}
    end

    timestamps()
  end

  object :repository do
    field :id,            :id
    field :name,          non_null(:string)
    field :description,   :string
    field :documentation, :string
    field :publisher,     :publisher, resolve: dataloader(User)

    field :icon, :string, resolve: fn
      repo, _, _ -> {:ok, Core.Storage.url({repo.icon, repo}, :original)}
    end

    field :installation, :installation, resolve: fn
      repo, _, context -> Repository.resolve_installation(repo, context)
    end

    field :editable, :boolean, resolve: fn
      repo, _, %{context: %{current_user: user}} -> Repository.editable(repo, user)
    end

    field :public_key, :string, resolve: fn
      repo, _, %{context: %{current_user: user}} -> Repository.resolve_public_key(repo, user)
    end

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
    field :repository,   :repository, resolve: dataloader(Repository)
    field :user,         :user, resolve: dataloader(User)
    field :auto_upgrade, :boolean

    field :license,    :string, resolve: fn
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

  object :dependencies do
    field :dependencies, list_of(:dependency)
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

    field :package, :string, resolve: fn
      repo, _, _ -> {:ok, Core.Storage.url({repo.package, repo}, :original)}
    end
    field :repository, :repository, resolve: dataloader(Repository)
    field :editable, :boolean, resolve: fn
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
    field :repository,      :repository, resolve: dataloader(Repository)
    field :recipe_sections, list_of(:recipe_section), resolve: dataloader(Recipe)

    timestamps()
  end

  object :recipe_section do
    field :id,           :id
    field :repository,   :repository, resolve: dataloader(Repository)
    field :recipe,       :recipe, resolve: dataloader(Recipe)
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

  enum :configuration_type do
    value :int
    value :bool
    value :string
  end

  object :recipe_configuration do
    field :type,    :configuration_type
    field :name,    :string
    field :default, :string
  end

  connection node_type: :user
  connection node_type: :publisher
  connection node_type: :repository
  connection node_type: :chart
  connection node_type: :version
  connection node_type: :installation
  connection node_type: :terraform
  connection node_type: :terraform_installation
  connection node_type: :chart_installation
  connection node_type: :persisted_token
  connection node_type: :docker_repository
  connection node_type: :docker_image
  connection node_type: :webhook
  connection node_type: :recipe
end