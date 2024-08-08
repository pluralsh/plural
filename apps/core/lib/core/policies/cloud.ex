defmodule Core.Policies.Cloud do
  use Piazza.Policy
  alias Core.Schema.{User, ConsoleInstance}
  alias Core.Services.Payments

  def can?(%User{} = user, %ConsoleInstance{}, :create) do
    case Payments.has_feature?(user, :cd) do
      true -> :pass
      _ -> {:error, "you must be on a paid plan to use Plural Cloud"}
    end
  end

  def can?(u, %Ecto.Changeset{} = cs, action), do: can?(u, apply_changes(cs), action)

  def can?(_, _, _), do: :pass
end
