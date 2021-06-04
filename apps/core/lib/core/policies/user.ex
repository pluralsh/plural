defmodule Core.Policies.User do
  use Piazza.Policy
  import Core.Policies.Utils
  alias Core.Schema.{User, PersistedToken, Publisher, PublicKey}

  def can?(%User{} = user, %Publisher{} = pub, _) do
    %{account: account} = Core.Repo.preload(pub, [:account])
    check_rbac(user, :publish, account: account)
  end

  def can?(%User{id: id}, %PublicKey{user_id: id}, _), do: :pass

  def can?(%User{id: user_id}, %PersistedToken{user_id: user_id}, :edit),
    do: :pass

  def can?(_, _, _), do: {:error, :forbidden}
end
