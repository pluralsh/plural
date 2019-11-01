defmodule Core.Services.Repositories do
  use Core.Services.Base
  import Core.Policies.Repository
  alias Core.Services.Users
  alias Core.Schema.{Repository, Installation, User}

  def get_installation!(id),
    do: Core.Repo.get!(Installation, id)

  def get_installation(user_id, repo_id) do
    Core.Repo.get_by(Installation, repository_id: repo_id, user_id: user_id)
  end

  def get_repository!(id), do: Core.Repo.get(Repository, id)

  def get_repository_by_name!(name),
    do: Core.Repo.get_by(Repository, name: name)

  def create_repository(attrs, %User{} = user) do
    publisher = Users.get_publisher_by_owner!(user.id)

    %Repository{publisher_id: publisher.id}
    |> Repository.changeset(attrs)
    |> Core.Repo.insert()
  end

  def update_repository(attrs, repo_id, %User{} = user) do
    get_repository!(repo_id)
    |> Repository.changeset(attrs)
    |> allow(user, :edit)
    |> when_ok(:update)
  end

  def create_installation(attrs, repository_id, %User{} = user) do
    %Installation{repository_id: repository_id, user_id: user.id}
    |> Installation.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
  end

  def update_installation(attrs, inst_id, %User{} = user) do
    get_installation!(inst_id)
    |> Installation.changeset(attrs)
    |> allow(user, :edit)
    |> when_ok(:update)
  end

  def authorize(repo_id, %User{} = user) when is_binary(repo_id) do
    get_repository!(repo_id)
    |> authorize(user)
  end
  def authorize(%Repository{} = repo, user),
    do: allow(repo, user, :access)
end