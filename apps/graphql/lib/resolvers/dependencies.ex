defmodule GraphQl.Resolvers.Dependencies do
  alias Core.Schema.{Chart, Terraform}
  alias Core.Services.{Charts, Dependencies}
  alias Core.Services.Terraform, as: TfSvc

  defmodule Closure, do: defstruct [:terraform, :helm]

  def resolve_closure(args, _) do
    resource = find_resource(args)
    closure  = Dependencies.closure(resource)

    {:ok, %Closure{
      terraform: filter(closure, :terraform),
      helm: filter(closure, :helm)
    }}
  end

  defp filter(closure, type) do
    Enum.filter(closure, fn
      %Chart{} -> type == :helm
      %Terraform{} -> type == :terraform
    end)
  end

  defp find_resource(%{type: :terraform, id: id}), do: TfSvc.get_tf!(id)
  defp find_resource(%{type: :helm, id: id}), do: Charts.get_chart!(id)
end