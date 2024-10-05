defmodule Core.Policies.OAuth do
  use Piazza.Policy
  alias Core.Schema.{User, OIDCProvider}

  def can?(%User{id: id}, %OIDCProvider{owner_id: id}, _), do: :pass

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end
