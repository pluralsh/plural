defmodule GraphQl.Resolvers.Repository do
  use GraphQl.Resolvers.Base, model: Core.Schema.Repository
  alias Core.Services.{Repositories, Users}
  alias Core.Schema.{
    Installation,
    Integration,
    ResourceDefinition,
    Tag,
    Artifact,
    Dashboard,
    Shell,
    Database,
    OIDCProvider,
    OIDCProviderBinding
  }

  def query(Tag, _), do: Tag
  def query(Integration, _), do: Integration
  def query(ResourceDefinition, _), do: ResourceDefinition
  def query(Installation, %{current_user: user}), do: Installation.for_user(user.id)
  def query(Installation, _), do: Installation
  def query(Dashboard, _), do: Dashboard
  def query(Artifact, _), do: Artifact.ordered()
  def query(Database, _), do: Database
  def query(Shell, _), do: Shell
  def query(OIDCProvider, _), do: OIDCProvider
  def query(OIDCProviderBinding, _), do: OIDCProviderBinding
  def query(_, _), do: Repository

  def resolve_public_key(repo, user) do
    case Core.Policies.Repository.can?(user, repo, :edit) do
      {:error, _} -> {:ok, nil}
      _ -> {:ok, repo.public_key}
    end
  end

  def accessible(repo, user), do: Core.Policies.Repository.allow(repo, user, :access)

  def resolve_repository(%{id: repo_id}, %{context: %{current_user: user}}) do
    Repositories.get_repository!(repo_id)
    |> preload()
    |> accessible(user)
  end

  def resolve_repository(%{name: repo_name}, %{context: %{current_user: user}}) do
    Repositories.get_repository_by_name!(repo_name)
    |> preload()
    |> accessible(user)
  end

  defp preload(repo), do: Core.Repo.preload(repo, [:publisher])

  def resolve_installation(%{name: repo_name}, %{context: %{current_user: user}}) do
    repo = Repositories.get_repository_by_name!(repo_name)
    {:ok, Repositories.get_installation(user.id, repo.id)}
  end

  def resolve_installation(%{id: repo_id}, %{context: %{current_user: user}}),
    do: {:ok, Repositories.get_installation(user.id, repo_id)}

  def list_repositories(args, %{context: ctx}) do
    user = ctx[:current_user]
    Repository.ordered()
    |> Repository.accessible(user)
    |> apply_filters(args, user)
    |> paginate(args)
  end

  def list_categories(_, %{context: ctx}) do
    Repository.accessible(ctx[:current_user])
    |> Repository.categories()
    |> Core.Repo.all()
    |> ok()
  end

  def resolve_category(%{name: cat}, %{context: ctx}) do
    Repository.accessible(ctx[:current_user])
    |> Repository.for_category(cat)
    |> Repository.categories()
    |> Core.Repo.one()
    |> ok()
  end

  def search_repositories(%{query: q} = args, %{context: ctx}) do
    Repository.search(q)
    |> Repository.ordered()
    |> Repository.accessible(ctx[:current_user])
    |> paginate(args)
  end

  defp apply_filters(query, args, user) do
    Enum.reduce(args, query, &apply_filter(&2, &1, user))
  end

  defp apply_filter(query, {:installed, true}, %{id: id}),
    do: Repository.for_user(query, id)
  defp apply_filter(query, {:supports, true}, %{id: _} = user) do
    user = Core.Services.Rbac.preload(user)

    Repository.for_account(query, user.account_id)
    |> Repository.supported(user)
  end
  defp apply_filter(query, {:tag, tag}, _) when is_binary(tag), do: Repository.for_tag(query, tag)
  defp apply_filter(query, {:publisher_id, id}, _) when is_binary(id), do: Repository.for_publisher(query, id)
  defp apply_filter(query, {:q, q}, _) when is_binary(q), do: Repository.search(query, q)
  defp apply_filter(query, {:category, c}, _) when is_atom(c), do: Repository.for_category(query, c)
  defp apply_filter(query, _, _), do: query

  def list_installations(args, %{context: %{current_user: user}}) do
    Installation.for_user(user.id)
    |> Installation.ordered()
    |> paginate(args)
  end

  def list_integrations(%{repository_id: repo_id} = args, _) do
    Integration.for_repository(repo_id)
    |> maybe_add_tags(args)
    |> maybe_filter_type(args)
    |> Integration.ordered()
    |> paginate(args)
  end
  def list_integrations(%{repository_name: name} = args, context) do
    repo = Repositories.get_repository_by_name!(name)

    Map.put(args, :repository_id, repo.id)
    |> list_integrations(context)
  end

  defp maybe_add_tags(query, %{tag: tag}) when is_binary(tag),
    do: Integration.for_tag(query, tag)
  defp maybe_add_tags(query, _), do: query

  defp maybe_filter_type(query, %{type: type}) when is_binary(type),
    do: Integration.for_type(query, type)
  defp maybe_filter_type(query, _), do: query

  def editable(repo, user) do
    case Core.Policies.Repository.can?(user, repo, :edit) do
      {:error, _} -> {:ok, false}
      _ -> {:ok, true}
    end
  end

  def protected_field(repo, user, field) do
    case Core.Policies.Repository.can?(user, repo, :edit) do
      {:error, _} -> {:ok, nil}
      _ -> {:ok, Map.get(repo, field)}
    end
  end

  def upsert_integration(%{attributes: attrs, repository_name: name}, %{context: %{current_user: user}}) do
    repo = Repositories.get_repository_by_name!(name)
    Repositories.upsert_integration(attrs, repo.id, user)
  end

  def create_repository(%{attributes: attrs, id: id}, %{context: %{current_user: user}}) when is_binary(id),
    do: Repositories.create_repository(attrs, id, user)
  def create_repository(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Repositories.create_repository(attrs, user)

  def update_repository(%{attributes: attrs, repository_id: repo_id}, %{context: %{current_user: user}}),
    do: Repositories.update_repository(attrs, repo_id, user)
  def update_repository(%{repository_name: name} = args, context) do
    repo = Repositories.get_repository_by_name!(name)

    Map.put(args, :repository_id, repo.id)
    |> update_repository(context)
  end

  def upsert_repository(%{attributes: attrs, name: name, publisher: pub}, %{context: %{current_user: user}}) do
    publisher = Users.get_publisher_by_name!(pub)
    Repositories.upsert_repository(attrs, name, publisher.id, user)
  end

  def delete_repository(%{repository_id: repo_id}, %{context: %{current_user: user}}),
    do: Repositories.delete_repository(repo_id, user)

  def create_installation(%{repository_id: repo_id}, %{context: %{current_user: user}}),
    do: Repositories.create_installation(%{}, repo_id, user)

  def update_installation(%{id: inst_id, attributes: attrs}, %{context: %{current_user: user}}),
    do: Repositories.update_installation(attrs, inst_id, user)

  def delete_installation(%{id: id}, %{context: %{current_user: user}}),
    do: Repositories.delete_installation(id, user)

  def reset_installations(_, %{context: %{current_user: user}}),
    do: Repositories.reset_installations(user)

  def create_oidc_provider(%{attributes: attrs, installation_id: id}, %{context: %{current_user: user}}),
    do: Repositories.create_oidc_provider(attrs, id, user)

  def update_oidc_provider(%{attributes: attrs, installation_id: id}, %{context: %{current_user: user}}),
    do: Repositories.update_oidc_provider(attrs, id, user)

  def upsert_oidc_provider(%{attributes: attrs, installation_id: id}, %{context: %{current_user: user}}),
    do: Repositories.upsert_oidc_provider(attrs, id, user)

  def create_artifact(%{repository_id: repo_id, attributes: attrs}, %{context: %{current_user: user}}),
    do: Repositories.create_artifact(attrs, repo_id, user)
  def create_artifact(%{repository_name: name, attributes: attrs}, %{context: %{current_user: user}}) do
    repo = Repositories.get_repository_by_name!(name)
    Repositories.create_artifact(attrs, repo.id, user)
  end

  def acquire_apply_lock(%{repository: name}, %{context: %{current_user: user}}) do
    repo = Repositories.get_repository_by_name!(name)
    Repositories.acquire_apply_lock(repo.id, user)
  end

  def release_apply_lock(%{attributes: attrs, repository: name}, %{context: %{current_user: user}}) do
    repo = Repositories.get_repository_by_name!(name)
    Repositories.release_apply_lock(attrs, repo.id, user)
  end

  def generate_scaffold(%{application: app} = ctx, _) do
    Core.Services.Scaffolds.generate(app, ctx)
    |> Enum.map(fn {file, content} ->
      %{path: file, content: content}
    end)
    |> ok()
  end
end
