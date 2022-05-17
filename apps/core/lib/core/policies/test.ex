defmodule Core.Policies.Test do
  use Piazza.Policy
  alias Core.Schema.{User, Test, TestStep}
  alias Core.Policies.Repository

  def can?(%User{} = user, %Test{} = test, :create) do
    %{repository: repo} = Core.Repo.preload(test, [repository: [publisher: :account]])
    Repository.can?(user, repo, :edit)
    |> error("you cannot create tests for this repo, do you have publish permissions?")
  end

  def can?(%User{id: user_id}, %Test{creator_id: user_id}, :edit), do: :pass

  def can?(%User{} = user, %TestStep{} = step, :edit) do
    %{test: test} = Core.Repo.preload(step, [:test])
    can?(user, test, :edit)
  end

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end
