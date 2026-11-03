defmodule Core.Policies.OAuth do
  use Piazza.Policy
  import Core.Policies.Utils
  alias Core.Schema.{User, OIDCProvider}

  def can?(%User{id: id}, %OIDCProvider{owner_id: id}, _), do: :pass
  def can?(%User{} = user, %OIDCProvider{owner_id: owner_id}, _) when is_binary(owner_id),
    do: impersonates?(user, Core.Repo.get(User, owner_id))

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end
