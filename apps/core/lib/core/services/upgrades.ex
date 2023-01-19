defmodule Core.Services.Upgrades do
  use Core.Services.Base
  import Core.Rollable.Utils
  alias Core.Schema.{
    User,
    UpgradeQueue,
    Upgrade,
    DeferredUpdate,
    ChartInstallation,
    TerraformInstallation
  }
  alias Core.Services.{Dependencies, Locks}
  alias Core.PubSub

  def get_queue(id), do: Core.Repo.get(UpgradeQueue, id)

  def get_queue(user_id, name), do: Core.Repo.get_by(UpgradeQueue, user_id: user_id, name: name)

  def queue_count(user_id) do
    UpgradeQueue.for_user(user_id)
    |> Core.Repo.aggregate(:count, :id)
  end

  def authorize(id, %User{id: user_id}) do
    case get_queue(id) do
      %UpgradeQueue{user_id: ^user_id} = q -> {:ok, q}
      _ -> {:error, :unauthorized}
    end
  end

  def poll_deferred_updates(type, limit) do
    lock = lock_name(type)

    start_transaction()
    |> add_operation(:lock, fn _ -> Locks.acquire(lock, Ecto.UUID.generate()) end)
    |> add_operation(:updates, fn _ ->
      DeferredUpdate.dequeue(:"#{type}_installation_id", limit)
      |> Core.Repo.all()
      |> ok()
    end)
    |> add_operation(:release, fn _ -> Locks.release(lock) end)
    |> execute(extract: :updates)
  end

  defp lock_name(type), do: "#{type}_deferred_updates"

  def create_deferred_update(version_id, %ChartInstallation{id: id}, %User{id: user_id}) do
    %DeferredUpdate{user_id: user_id}
    |> DeferredUpdate.changeset(%{
      chart_installation_id: id,
      version_id: version_id,
      dequeue_at: Timex.now()
    })
    |> Core.Repo.insert()
  end

  def create_deferred_update(version_id, %TerraformInstallation{id: id}, %User{id: user_id}) do
    %DeferredUpdate{user_id: user_id}
    |> DeferredUpdate.changeset(%{
      terraform_installation_id: id,
      version_id: version_id,
      dequeue_at: Timex.now()
    })
    |> Core.Repo.insert()
  end

  def deferred_apply(%DeferredUpdate{} = update) do
    %{user: user, version: version} = update =
      Core.Repo.preload(update, [:user, :terraform_installation, :chart_installation, version: [:chart, :terraform]])

    case Dependencies.valid?(version.dependencies, user) do
      true ->
        apply_deferred_update(update)
      _ ->
        dequeue = Timex.now() |> Timex.shift(hours: DeferredUpdate.wait_time(update))

        update
        |> Ecto.Changeset.change(%{dequeue_at: dequeue, attempts: update.attempts + 1})
        |> Core.Repo.update()
    end
  end

  defp apply_deferred_update(%DeferredUpdate{version_id: id, version: version} = update) do
    start_transaction()
    |> add_operation(:update, fn _ ->
      update_inst(update)
      |> Ecto.Changeset.change(%{version_id: id})
      |> Core.Repo.update()
    end)
    |> add_operation(:upgrade, fn _ ->
      Core.Rollable.Base.deliver_upgrades(update.user_id, fn queue ->
        Core.Services.Upgrades.create_upgrade(%{
          repository_id: repo_id(version),
          message: "Upgraded #{type(version)} #{pkg_name(version)} to #{version.version}"
        }, queue)
      end)
    end)
    |> add_operation(:clean, fn _ -> Core.Repo.delete(update) end)
    |> execute(extract: :clean)
  end

  defp update_inst(%{chart_installation: %ChartInstallation{} = inst}), do: inst
  defp update_inst(%{terraform_installation: %TerraformInstallation{} = inst}), do: inst

  def create_queue(%{name: name} = attrs, %User{id: user_id} = user) do
    queue = get_queue(user_id, name)

    start_transaction()
    |> add_operation(:queue, fn _ ->
      case queue do
        %UpgradeQueue{} = q -> q
        nil -> %UpgradeQueue{user_id: user.id}
      end
      |> UpgradeQueue.changeset(attrs)
      |> Core.Repo.insert_or_update()
    end)
    |> execute(extract: :queue)
    |> notify(:upsert, queue)
  end

  def delete_queue(%UpgradeQueue{} = queue) do
    start_transaction()
    |> add_operation(:q, fn _ -> Core.Repo.delete(queue) end)
    |> add_operation(:account, fn _ ->
      %{user: user} = Core.Repo.preload(queue, [:user])
      case Core.PubSub.Consumers.Usage.apply_counts(user.account_id, cluster: -1) do
        {1, _} -> {:ok, queue}
        _ -> {:error, :usage_failure}
      end
    end)
    |> execute(extract: :q)
  end

  def create_upgrade(params, %UpgradeQueue{} = queue) do
    %Upgrade{queue_id: queue.id}
    |> Upgrade.changeset(params)
    |> Core.Repo.insert()
    |> when_ok(& %{&1 | queue: queue})
    |> notify(:create)
  end

  def next(%UpgradeQueue{id: id, acked: acked}) do
    Upgrade.after_seq(acked)
    |> Upgrade.for_queue(id)
    |> Upgrade.ordered()
    |> Upgrade.limit(1)
    |> Core.Repo.one()
    |> Core.Repo.preload([:repository])
  end

  def ping(%UpgradeQueue{} = q) do
    Ecto.Changeset.change(q, %{pinged_at: Timex.now()})
    |> Core.Repo.update()
    |> notify(:update)
  end

  def ack(id, %UpgradeQueue{acked: nil} = q) do
    Ecto.Changeset.change(q, %{acked: id})
    |> Core.Repo.update()
    |> notify(:update)
  end

  def ack(id, %UpgradeQueue{acked: last}) when last > id, do: {:error, :invalid_ack}

  def ack(id, %UpgradeQueue{} = q) do
    Ecto.Changeset.change(q, %{acked: id})
    |> Core.Repo.update()
    |> notify(:update)
  end

  defp notify({:ok, %Upgrade{} = upgrade}, :create),
    do: handle_notify(PubSub.UpgradeCreated, upgrade)
  defp notify({:ok, %UpgradeQueue{} = q}, :update),
    do: handle_notify(PubSub.UpgradeQueueUpdated, q)

  defp notify(pass, _), do: pass

  defp notify({:ok, %UpgradeQueue{} = q}, :upsert, nil),
    do: handle_notify(PubSub.UpgradeQueueCreated, q)
  defp notify({:ok, %UpgradeQueue{} = q}, :upsert, _),
    do: handle_notify(PubSub.UpgradeQueueUpdated, q)

  defp notify(pass, _, _), do: pass
end
