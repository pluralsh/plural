defmodule GraphQl.Resolvers.Dependencies do
  alias Core.Services.{Charts, Dependencies}
  alias Core.Services.Terraform, as: TfSvc

  defmodule Closure, do: defstruct [:terraform, :helm]

  def resolve_closure(args, _) do
    resource = find_resource(args)
    closure  = Dependencies.closure(resource)

    {:ok, closure}
  end

  defp find_resource(%{type: :terraform, id: id}), do: TfSvc.get_tf!(id)
  defp find_resource(%{type: :helm, id: id}), do: Charts.get_chart!(id)
end
