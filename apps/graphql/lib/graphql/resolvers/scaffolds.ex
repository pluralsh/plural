defmodule GraphQl.Resolvers.Scaffolds do
  alias Core.Services.Scaffolds

  def list_providers(_, _) do
    {:ok, Scaffolds.available_providers()}
  end

  def provider(%{name: name}, _) do
    {:ok, Scaffolds.provider(name)}
  end
end
