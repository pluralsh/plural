defmodule Core.Policies.User do
  use Piazza.Policy
  import Core.Policies.Utils
  alias Core.Schema.{User, PersistedToken, Publisher, PublicKey, EabCredential}

  def can?(%User{} = user, %Publisher{} = pub, _) do
    %{account: account} = Core.Repo.preload(pub, [:account])
    check_rbac(user, :publish, account: account)
  end

  def can?(%User{id: id}, %EabCredential{user_id: id}, _), do: :pass

  def can?(%User{id: id}, %PublicKey{user_id: id}, _), do: :pass

  def can?(%User{id: user_id}, %PersistedToken{user_id: user_id}, :edit),
    do: :pass

  def can?(%User{id: id}, %User{id: id}, :delete), do: {:error, "you cannot delete yourself"}
  def can?(%User{account_id: aid} = actor, %User{id: id, account_id: aid}, :delete) do
    %{account: account} = actor = Core.Repo.preload(actor, [:account])
    case account.root_user_id == id do
      true -> {:error, "you cannot delete the root user for your account"}
      false -> check_rbac(actor, :users, account: account)
    end
  end

  def can?(_, _, _), do: {:error, :forbidden}
end
