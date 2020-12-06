defmodule Core.Policies.Account do
  use Piazza.Policy
  alias Core.Schema.{User, Account}

  def can?(%User{id: id}, %Account{root_user_id: id}, _), do: :pass

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end