defmodule GraphQl.Resolvers.Scaffolds do
  alias Core.Services.Scaffolds

  def list_providers(_, _) do
    {:ok, Scaffolds.available_providers()}
  end

  def provider(%{name: name} = args, _) do
    {:ok, Scaffolds.provider(name, args[:vsn])}
  end
end
