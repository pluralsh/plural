defmodule Core.Policies.Publisher do
  use Piazza.Policy
  alias Core.Schema.{User, Publisher}

  def can?(%User{id: user_id}, %Publisher{owner_id: user_id}, _), do: :continue
  def can?(_, _, _), do: {:error, :forbidden}
end