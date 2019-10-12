defmodule Core.Policies.Repository do
  use Piazza.Policy
  alias Core.Schema.{User, Installation}

  def can?(%User{id: user_id}, %Installation{user_id: user_id}, :access), do: :continue
  def can?(%User{}, %Installation{}, :create), do: :pass

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end