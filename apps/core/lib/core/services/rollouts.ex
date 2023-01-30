defmodule Core.Services.Rollouts do
  use Core.Services.Base
  alias Core.Services.Locks
  alias Core.Schema.{Rollout, Version, Dependencies, ChartInstallation, TerraformInstallation}
  alias Core.Rollouts.Rollable
  alias Core.PubSub

  def get_rollout!(id), do: Core.Repo.get!(Rollout, id)

  def unlock(name, user) do
    start_transaction()
    |> add_operation(:charts, fn _ ->
      unlock_module(ChartInstallation, name, user)
    end)
    |> add_operation(:tfs, fn _ ->
      unlock_module(TerraformInstallation, name, user)
    end)
    |> Core.Repo.transaction()
    |> case do
      {:ok, %{charts: c, tfs: t}} -> {:ok, c + t}
      err -> err
    end
  end

  defp unlock_module(mod, name, user) do
    mod.for_repo_name(name)
    |> mod.for_user(user.id)
    |> Core.Repo.update_all(set: [locked: false])
    |> elem(0)
    |> ok()
  end

  def lock_installation(%Version{dependencies: %Dependencies{breaking: b, dedicated: d}}, inst) when b or d do
    Ecto.Changeset.change(inst, %{locked: true})
    |> Core.Repo.update()
    |> notify(:locked)
  end
  def lock_installation(_, inst), do: {:ok, inst}

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
    event = Rollable.preload(event)

    Rollable.query(event)
    |> Core.Repo.stream(method: :keyset)
    |> Core.throttle(count: 2, pause: 10)
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
    |> Core.pause(2)
    |> update_rollout(%{status: :finished})
  end

  def poll(limit \\ 10) do
    owner = Ecto.UUID.generate()

    start_transaction()
    |> add_operation(:lock, fn _ -> Locks.acquire("rollout", owner) end)
    |> add_operation(:fetch, fn _ ->
      Rollout
      |> Rollout.dequeue(limit)
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
    |> add_operation(:release, fn _ -> Locks.release("rollout") end)
    |> execute(extract: :mark)
    |> when_ok(&notify(&1, :update_all))
  end

  defp notify({:ok, inst}, :locked),
    do: handle_notify(PubSub.InstallationLocked, inst)
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
