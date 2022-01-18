defmodule GraphQl.Resolvers.Shell do
  use GraphQl.Resolvers.Base, model: Core.Schema.CloudShell
  alias Core.Services.Shell

  def resolve_shell(_, %{context: %{current_user: user}}),
    do: {:ok, Shell.get_shell(user.id)}

  def create_shell(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Shell.create_shell(attrs, user)

  def liveness(shell), do: {:ok, Shell.alive?(shell)}
end
