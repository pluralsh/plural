defmodule GraphQl.Middleware.UpgradeQueue do
  @behaviour Absinthe.Middleware
  import Absinthe.Resolution, only: [put_result: 2]
  alias Core.Schema.User
  alias Core.Services.Upgrades

  def call(%{arguments: %{queue_id: queue_id}, context: %{current_user: %User{} = user} = context} = res, _) when is_binary(queue_id) do
    case Upgrades.authorize(queue_id, user) do
      {:ok, q} -> %{res | context: Map.put(context, :queue, q)}
      _ -> put_result(res, {:error, "forbidden"})
    end
  end

  def call(%{context: %{current_user: user} = ctx} = res, _) do
    %{queue: q} = Core.Repo.preload(user, [:queue])
    %{res | context: Map.put(ctx, :queue, q)}
  end
end
