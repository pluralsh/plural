defmodule Core.Policies.Shell do
  use Piazza.Policy
  import Core.Policies.Utils
  alias Core.Schema.{User, CloudShell}

  def can?(%User{} = user, %CloudShell{}, :create) do
    check_rbac(user, :install, repository: "console", account: user.account)
    |> error("users without install permissions cannot create cloud shells")
  end

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end
