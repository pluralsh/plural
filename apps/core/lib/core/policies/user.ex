defmodule Core.Policies.User do
  use Piazza.Policy
  alias Core.Schema.{User, PersistedToken}

  def can?(%User{id: user_id}, %PersistedToken{user_id: user_id}, :edit),
    do: :pass
  def can?(_, _, _), do: {:error, :forbidden}
end