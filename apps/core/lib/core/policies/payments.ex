defmodule Core.Policies.Payments do
  use Piazza.Policy
  alias Core.Schema.{Plan, Subscription, User}
  alias Core.Policies.Publisher

  def can?(user, %Plan{} = plan, action) do
    %{repository: %{publisher: pub}} = Core.Repo.preload(plan, [repository: :publisher])
    Publisher.can?(user, pub, action)
  end

  def can?(%User{id: user_id}, %Subscription{plan: %Plan{repository_id: repo_id}} = sub, _) do
    case Core.Repo.preload(sub, [:installation]) do
      %{installation: %{user_id: ^user_id, repository_id: ^repo_id}} -> :pass
      _ -> {:error, :forbidden}
    end
  end

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end