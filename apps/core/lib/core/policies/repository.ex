defmodule Core.Policies.Repository do
  use Piazza.Policy
  alias Core.Schema.{User, Installation, Repository}
  alias Core.Services.Repositories

  def can?(%User{id: user_id}, %Repository{} = repo, :access) do
    case Core.Repo.preload(repo, [:publisher]) do
      %{publisher: %{owner_id: ^user_id}} -> :continue
      repo ->
        if Repositories.get_installation(user_id, repo.id), do: :continue, else: {:error, :forbidden}
    end
  end
  def can?(%User{id: user_id}, %Installation{user_id: user_id}, :access), do: :continue
  def can?(%User{}, %Installation{}, :create), do: :pass

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end