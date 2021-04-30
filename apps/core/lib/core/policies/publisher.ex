defmodule Core.Policies.Publisher do
  use Piazza.Policy
  import Core.Policies.Utils
  alias Core.Schema.{User, Publisher}

  def can?(%User{id: user_id}, %Publisher{owner_id: user_id}, _), do: :pass

  def can?(%User{} = user, %Publisher{} = pub, _) do
    %{account: account} = Core.Repo.preload(pub, [:account])
    check_rbac(user, :publish, account: account)
  end

  def can?(_, _, _), do: {:error, :forbidden}
end
