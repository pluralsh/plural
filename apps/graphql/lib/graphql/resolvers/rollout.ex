defmodule GraphQl.Resolvers.Rollout do
  use GraphQl.Resolvers.Base, model: Core.Schema.Rollout

  def query(_, _), do: Rollout

  def list_rollouts(%{repository_id: id} = args, _) do
    Rollout.for_repository(id)
    |> Rollout.ordered()
    |> paginate(args)
  end
end
