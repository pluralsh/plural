defmodule Core.Policies.Repository do
  use Piazza.Policy
  import Core.Policies.Utils
  alias Core.Schema.{User, Installation, Repository, Integration, Artifact, DockerRepository, ApplyLock}

  def can?(%User{} = user, %Integration{} = integ, policy) do
    %{repository: repo} = Core.Repo.preload(integ, [:repository])
    can?(user, repo, policy)
  end

  def can?(%User{} = user, %Artifact{} = art, policy) do
    %{repository: repo} = Core.Repo.preload(art, [:repository])
    can?(user, repo, policy)
  end

  def can?(%User{account_id: aid} = user, %Repository{} = repo, :support) do
    case Core.Repo.preload(repo, [:publisher]) do
      %{publisher: %{account_id: ^aid}} ->
        check_rbac(user, :support, repository: repo.name)
      _ -> {:error, :forbidden}
    end
  end

  def can?(%User{account_id: aid}, %Repository{private: true} = repo, :access) do
    case Core.Repo.preload(repo, [:publisher]) do
      %{publisher: %{account_id: ^aid}} -> :continue
      _ -> {:error, :forbidden}
    end
  end

  def can?(%User{} = user, %DockerRepository{} = dkr, :edit) do
    %{repository: repo} = Core.Repo.preload(dkr, [repository: [publisher: :account]])
    can?(user, repo, :edit)
  end

  def can?(%User{id: id}, %ApplyLock{owner_id: id}, _), do: :pass
  def can?(%User{} = user, %ApplyLock{owner_id: nil} = lock, :create) do
    %{repository: repo} = Core.Repo.preload(lock, [repository: [publisher: :account]])
    can?(user, repo, :edit)
  end
  def can?(_, %ApplyLock{inserted_at: ins, updated_at: upd}, :create) do
    touched = upd || ins
    Timex.now()
    |> Timex.shift(minutes: -5)
    |> Timex.before?(touched)
    |> case do
      true -> {:error, "lock already in use"}
      false -> :pass
    end
  end

  def can?(%User{}, %Repository{}, :access), do: :continue

  def can?(%User{account_id: aid, id: user_id}, %Repository{} = repo, :pull) do
    case Core.Repo.preload(repo, [:publisher]) do
      %{publisher: %{account_id: ^aid}} -> :continue
      %{publisher: %{owner_id: ^user_id}} -> :continue
      _ ->
        if Core.Services.Repositories.get_installation(user_id, repo.id),
          do: :continue, else: {:error, :forbidden}
    end
  end

  def can?(%User{} = user, %Repository{} = repo, action) when action in [:create, :edit] do
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
    |> error("your user cannot install, perhaps create a role with the appropriate permissions?")
  end

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end
