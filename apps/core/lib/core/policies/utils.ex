defmodule Core.Policies.Utils do
  alias Core.Services.Rbac

  def check_rbac(user, action, opts \\ []) do
    case Rbac.validate(user, action, opts) do
      true -> :continue
      _ -> {:error, :forbidden}
    end
  end
end