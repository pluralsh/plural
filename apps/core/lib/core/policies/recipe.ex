defmodule Core.Policies.Recipe do
  use Piazza.Policy
  alias Core.Schema.Recipe

  def can?(user, %Recipe{} = recipe, action) do
    %{repository: repo} = Core.Repo.preload(recipe, [repository: :publisher])
    Core.Policies.Repository.can?(user, repo, action)
  end

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end