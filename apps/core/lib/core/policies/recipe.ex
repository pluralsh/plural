defmodule Core.Policies.Recipe do
  use Piazza.Policy
  alias Core.Schema.{Recipe, User, Stack}

  def can?(user, %Recipe{} = recipe, action) do
    %{repository: repo} = Core.Repo.preload(recipe, [repository: :publisher])
    Core.Policies.Repository.can?(user, repo, action)
  end

  def can?(%User{id: uid}, %Stack{creator_id: uid}, :delete), do: :pass

  def can?(%User{account_id: aid}, %Stack{account_id: aid}, _), do: :pass

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end
