defmodule Core.Policies.Utils do
  alias Core.Services.Rbac
  alias Core.Schema.User

  def check_rbac(user, action, opts \\ []) do
    case Rbac.validate(user, action, opts) do
      true -> :continue
      _ -> {:error, :forbidden}
    end
  end

  @doc """
  Resources owned by a service account (eg a cluster and its installations) are accessible to
  anyone allowed to impersonate it, so clients don't need to swap in an impersonated token first
  """
  def impersonates?(%User{id: id}, %User{id: id}), do: :pass
  def impersonates?(%User{} = user, %User{service_account: true} = owner) do
    Core.Repo.preload(user, [:account])
    |> Core.Policies.Account.can?(owner, :impersonate)
  end
  def impersonates?(_, _), do: {:error, :forbidden}
end