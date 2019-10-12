defmodule Core.Services.Repositories do
  use Core.Services.Base
  import Core.Policies.Repository
  alias Core.Services.Users
  alias Core.Schema.{Repository, Installation, User}

  def get_installation!(id), do: Core.Repo.get!(Installation, id)

  def get_installation(user_id, repo_id) do
    Core.Repo.get_by(Installation, repository_id: repo_id, user_id: user_id)
  end

  def create_repository(attrs, %User{} = user) do
    publisher = Users.get_publisher!(user.id)

    %Repository{publisher_id: publisher.id}
    |> Repository.changeset(attrs)
    |> Core.Repo.insert()
  end


  def create_installation(attrs, repository_id, %User{} = user) do
    %Installation{repository_id: repository_id, user_id: user.id}
    |> Installation.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
  end
end