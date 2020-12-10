defmodule Core.Policies.Repository do
  use Piazza.Policy
  import Core.Policies.Utils
  alias Core.Schema.{User, Installation, Repository, Integration, Artifact}
  alias Core.Services.Repositories

  def can?(%User{} = user, %Integration{} = integ, policy) do
    %{repository: repo} = Core.Repo.preload(integ, [:repository])
    can?(user, repo, policy)
  end

  def can?(%User{} = user, %Artifact{} = art, policy) do
    %{repository: repo} = Core.Repo.preload(art, [:repository])
    can?(user, repo, policy)
  end

  def can?(%User{id: user_id}, %Repository{} = repo, :access) do
    case Core.Repo.preload(repo, [:publisher]) do
      %{publisher: %{owner_id: ^user_id}} -> :continue
      repo ->
        if Repositories.get_installation(user_id, repo.id), do: :continue, else: {:error, :forbidden}
    end
  end

  def can?(%User{} = user, %Repository{} = repo, :edit) do
    case Core.Repo.preload(repo, [publisher: :account]) do
      %{publisher: pub} -> Core.Policies.Publisher.can?(user, pub, :edit)
      _ -> {:error, :forbidden}
    end
  end

  def can?(%User{id: user_id}, %Installation{user_id: user_id}, action) when action in [:edit, :access],
    do: :continue
  def can?(%User{} = user, %Installation{} = inst, :create) do
    %{repository: repo} = Core.Repo.preload(inst, [:repository])
    check_rbac(user, :install, repository: repo.name)
  end

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end