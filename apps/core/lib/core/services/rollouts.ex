defmodule Core.Services.Rollouts do
  use Core.Services.Base
  alias Core.Schema.Rollout
  alias Core.Rollouts.Rollable
  alias Core.PubSub

  def get_rollout!(id), do: Core.Repo.get!(Rollout, id)

  def create_rollout(repository_id, event) do
    %Rollout{repository_id: repository_id}
    |> Rollout.create_changeset(%{event: event})
    |> Core.Repo.insert()
    |> notify(:create)
  end

  def update_rollout(%Rollout{} = roll, attrs) do
    roll
    |> Rollout.changeset(attrs)
    |> Core.Repo.update()
    |> notify(:update)
  end

  def execute(%Rollout{event: event} = rollout) do
    Rollable.query(event)
    |> Core.Repo.stream(method: :keyset)
    |> Core.throttle(count: 10, pause: 500)
    |> Enum.reduce(rollout, fn record, rollout ->
      {:ok, rollout} =
        start_transaction()
        |> add_operation(:process, fn _ -> Rollable.process(event, record) end)
        |> add_operation(:mark, fn _ ->
          update_rollout(rollout, %{
            heartbeat: Timex.now(),
            cursor: record.id,
            count: rollout.count + 1
          })
        end)
        |> execute(extract: :mark)
      rollout
    end)
    |> update_rollout(%{status: :finished})
  end

  def poll() do
    start_transaction()
    |> add_operation(:fetch, fn _ ->
      Rollout.dequeue()
      |> Core.Repo.all()
      |> ok()
    end)
    |> add_operation(:mark, fn %{fetch: rollouts} ->
      rollouts
      |> Enum.map(& &1.id)
      |> Rollout.for_ids()
      |> Rollout.selected()
      |> Core.Repo.update_all(set: [heartbeat: Timex.now(), status: :running])
      |> elem(1)
      |> ok()
    end)
    |> execute(extract: :mark)
    |> when_ok(&notify(&1, :update_all))
  end

  defp notify({:ok, %Rollout{} = r}, :create),
    do: handle_notify(PubSub.RolloutCreated, r)
  defp notify({:ok, %Rollout{} = r}, :update),
    do: handle_notify(PubSub.RolloutUpdated, r)
  defp notify({:ok, [_ | _] = rs}, :update_all) do
    Enum.each(rs, &notify({:ok, &1}, :update))
    {:ok, rs}
  end

  defp notify(pass, _), do: pass
end
