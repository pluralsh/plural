defmodule Core.Policies.Test do
  use Piazza.Policy
  alias Core.Schema.{User, Test}
  alias Core.Policies.Repository

  def can?(%User{} = user, %Test{} = test, :create) do
    %{repository: repo} = Core.Repo.preload(test, [repository: [publisher: :account]])
    Repository.can?(user, repo, :edit)
  end

  def can?(%User{id: user_id}, %Test{creator_id: user_id}, :edit), do: :pass

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end
