defmodule Core.Rollable.Base do
  alias Ecto.Multi

  defmacro __using__(_) do
    quote do
      import Core.Rollable.Base
      use Core.Services.Base
    end
  end

  def preload_event(%{item: item} = event, preloads) do
    item = Core.Repo.preload(item, preloads)
    %{event | item: item}
  end

  def deliver_upgrades(user_id, builder) do
    Core.Upgrades.Utils.for_user(user_id)
    |> Enum.reduce(Multi.new(), fn queue, multi ->
      Multi.run(multi, queue.id, fn _, _ -> builder.(queue) end)
    end)
    |> Core.Repo.transaction()
    |> case do
      {:ok, res} -> {:ok, Map.values(res)}
      error -> error
    end
  end
end
