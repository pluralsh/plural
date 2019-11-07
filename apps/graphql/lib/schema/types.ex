defmodule GraphQl.Schema.Types do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{
    User,
    Repository,
    Chart,
    Terraform
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

    timestamps()
  end

  object :chart do
    field :id,             :id
    field :name,           non_null(:string)
    field :description,    :string
    field :latest_version, :string
    field :repository,     :repository, resolve: dataloader(Repository)

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
    field :id,         :id
    field :context,    :map
    field :repository, :repository, resolve: dataloader(Repository)
    field :user,       :user, resolve: dataloader(User)

    timestamps()
  end

  object :chart_installation do
    field :id,      :id
    field :chart,   :chart, resolve: dataloader(Chart)
    field :version, :version, resolve: dataloader(Chart)
    field :user,    :user, resolve: dataloader(User)

    timestamps()
  end

  object :terraform do
    field :id,              :id
    field :name,            :string
    field :readme,          :string
    field :description,     :string
    field :values_template, :string

    field :package, :string, resolve: fn
      repo, _, _ -> {:ok, Core.Storage.url({repo.package, repo}, :original)}
    end
    field :repository, :repository, resolve: dataloader(Repository)
    field :editable, :boolean, resolve: fn
      tf, _, %{context: %{current_user: user}} -> Terraform.editable(tf, user)
    end

    timestamps()
  end

  connection node_type: :user
  connection node_type: :publisher
  connection node_type: :repository
  connection node_type: :chart
  connection node_type: :version
  connection node_type: :installation
  connection node_type: :terraform
end