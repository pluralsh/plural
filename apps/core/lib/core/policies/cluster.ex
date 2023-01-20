defmodule Core.Policies.Cluster do
  use Piazza.Policy
  alias Core.Schema.{User, Cluster}

  def can?(%User{id: uid}, %Cluster{owner_id: uid}, _), do: :pass

  def can?(%User{} = user, %Cluster{owner: %User{} = owner}, :access),
    do: Core.Policies.Account.can?(user, owner, :impersonate)

  def can?(_, _, _), do: {:error, :forbidden}
end
