defmodule Core.Policies.Cluster do
  use Piazza.Policy
  import Core.Policies.Utils
  alias Core.Schema.{User, Cluster}

  def can?(%User{id: uid}, %Cluster{owner_id: uid}, _), do: :pass

  def can?(%User{} = user, %Cluster{owner: %User{} = owner}, :access),
    do: impersonates?(user, owner)

  def can?(_, _, _), do: {:error, :forbidden}
end
