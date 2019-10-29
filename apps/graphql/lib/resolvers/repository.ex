defmodule GraphQl.Resolvers.Repository do
  use GraphQl.Resolvers.Base, model: Core.Schema.Repository
  alias Core.Services.Repositories
  alias Core.Schema.{Installation}

  def query(_, _), do: Repository

  def resolve_repository(%{id: repo_id}, _),
    do: {:ok, Repositories.get_repository!(repo_id)}

  def resolve_installation(%{id: repo_id}, %{context: %{current_user: user}}),
    do: {:ok, Repositories.get_installation(user.id, repo_id)}

  def list_repositories(%{publisher_id: pid} = args, _) when not is_nil(pid) do
    Repository.for_publisher(pid)
    |> Repository.ordered()
    |> paginate(args)
  end

  def list_repositories(args, %{context: %{current_user: user}}) do
    Repository.for_user(user.id)
    |> Repository.ordered()
    |> paginate(args)
  end

  def list_installations(args, %{context: %{current_user: user}}) do
    Installation.for_user(user.id)
    |> Installation.ordered()
    |> paginate(args)
  end

  def create_repository(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Repositories.create_repository(attrs, user)

  def update_repository(%{attributes: attrs, repository_id: repo_id}, %{context: %{current_user: user}}),
    do: Repositories.update_repository(attrs, repo_id, user)
end