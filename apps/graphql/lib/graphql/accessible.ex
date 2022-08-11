defmodule GraphQl.Accessible do
  alias Core.Services.{Accounts}
  def load(id, :role), do: Accounts.get_role!(id)
  def load(id, :group), do: Accounts.get_group!(id)

  def accessible(id, user, type) do
    resource = load(id, type)
    case GraphQl.Accessible.Resource.accessible(resource, user) do
      :ok -> {:ok, resource}
      :error -> {:error, "forbidden"}
    end
  end
end

defprotocol GraphQl.Accessible.Resource do
  @fallback_to_any true
  def accessible(resource, user)
end

defimpl GraphQl.Accessible.Resource, for: Any do
  def accessible(_, _), do: :error
end

defimpl GraphQl.Accessible.Resource, for: Core.Schema.Group do
  alias Core.Schema.{User, Group}
  def accessible(%Group{account_id: aid}, %User{account_id: aid}), do: :ok
  def accessible(_, _), do: :error
end

defimpl GraphQl.Accessible.Resource, for: Core.Schema.Role do
  alias Core.Schema.{User, Role}
  def accessible(%Role{account_id: aid}, %User{account_id: aid}), do: :ok
  def accessible(_, _), do: :error
end
