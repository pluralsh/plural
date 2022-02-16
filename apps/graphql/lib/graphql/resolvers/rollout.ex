defmodule GraphQl.Resolvers.Rollout do
  use GraphQl.Resolvers.Base, model: Core.Schema.Rollout
  alias Core.Services.Rollouts

  def query(_, _), do: Rollout

  def unlock(%{name: name}, %{context: %{current_user: user}}),
    do: Rollouts.unlock(name, user)

  def list_rollouts(%{repository_id: id} = args, _) do
    Rollout.for_repository(id)
    |> Rollout.ordered()
    |> paginate(args)
  end
end
