defmodule Core.Services.Upgrades do
  use Core.Services.Base
  import Core.Rollable.Utils
  require Logger
  alias Core.Schema.{
    User,
    Version,
    Upgrade,
    UpgradeQueue,
    DeferredUpdate,
    ChartInstallation,
    TerraformInstallation
  }
  alias Core.Schema.Dependencies, as: Deps
  alias Core.Services.{Dependencies, Locks, Clusters, Payments, Rollouts}
  alias Core.PubSub

  @type inst :: TerraformInstallation.t | ChartInstallation.t
  @type error :: {:error, term}
  @type queue_resp :: {:ok, UpgradeQueue.t} | error
  @type upgrade_resp :: {:ok, Upgrade.t} | error
  @type deferred_resp :: {:ok, DeferredUpdate.t} | error

  @spec get_queue(binary) :: UpgradeQueue.t | nil
  def get_queue(id), do: Core.Repo.get(UpgradeQueue, id)

  @spec get_queue(binary, binary) :: UpgradeQueue.t | nil
  def get_queue(user_id, name), do: Core.Repo.get_by(UpgradeQueue, user_id: user_id, name: name)

  @spec queue_count(binary) :: integer
  def queue_count(user_id) do
    UpgradeQueue.for_user(user_id)
    |> Core.Repo.aggregate(:count, :id)
  end

  @doc """
  Determines whether your user can touch this q
  """
  @spec authorize(binary, User.t) :: queue_resp
  def authorize(id, %User{id: user_id}) do
    get_queue(id)
    |> Core.Repo.preload([:cluster])
    |> case do
      %UpgradeQueue{user_id: ^user_id} = q -> {:ok, q}
      _ -> {:error, :unauthorized}
    end
  end

  @doc """
  Create a new upgrade queue
  """
  @spec create_queue(map, User.t) :: queue_resp
  def create_queue(%{name: name} = attrs, %User{id: user_id, email: email} = user) do
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
    |> add_operation(:cluster, fn %{queue: q} ->
      case Clusters.create_from_queue(q) do
        {:ok, _} = res -> res
        err ->
          Logger.info "could not create cluster from q for #{email}: #{inspect(err)}"
          {:ok, nil}
      end
    end)
    |> add_operation(:refetch, fn %{queue: q} -> {:ok, get_queue(q.id)} end)
    |> execute(extract: :refetch)
    |> notify(:upsert, queue)
  end

  @doc """
  Deletes this upgrade queue (done when the pinged time expires)
  """
  @spec delete_queue(UpgradeQueue.t) :: queue_resp
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

  @doc """
  Create an upgrade queue
  """
  @spec create_upgrade(map, UpgradeQueue.t) :: upgrade_resp
  def create_upgrade(params, %UpgradeQueue{} = queue) do
    %Upgrade{queue_id: queue.id}
    |> Upgrade.changeset(params)
    |> Core.Repo.insert()
    |> when_ok(& %{&1 | queue: queue})
    |> notify(:create)
  end

  @doc """
  Fetch the next unacked upgrade in this queue
  """
  @spec next(UpgradeQueue.t) :: Upgrade.t | nil
  def next(%UpgradeQueue{id: id, acked: acked}) do
    Upgrade.after_seq(acked)
    |> Upgrade.for_queue(id)
    |> Upgrade.ordered()
    |> Upgrade.limit(1)
    |> Core.Repo.one()
    |> Core.Repo.preload([:repository])
  end

  @doc """
  update the pinged date for this queue
  """
  @spec ping(UpgradeQueue.t) :: queue_resp
  def ping(%UpgradeQueue{} = q) do
    %{cluster: cluster} = Core.Repo.preload(q, [:cluster])

    start_transaction()
    |> add_operation(:queue, fn _ ->
      Ecto.Changeset.change(q, %{pinged_at: Timex.now()})
      |> Core.Repo.update()
    end)
    |> add_operation(:cluster, fn _ ->
      case cluster do
        nil -> {:ok, %{}}
        _ ->
          Ecto.Changeset.change(cluster, %{pinged_at: Timex.now()})
          |> Core.Repo.update()
      end
    end)
    |> execute(extract: :queue)
    |> notify(:update)
  end

  @doc """
  Marks the current pointer for this queue at `id`
  """
  @spec ack(binary, UpgradeQueue.t) :: queue_resp
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


  @doc """
  Get the next batch of deferred updates to potentially apply
  """
  @spec poll_deferred_updates(:chart | :terraform, integer) :: [DeferredUpdate.t]
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


  @doc """
  Create a new deferred update with `attrs`
  """
  @spec create_deferred_update(map, binary, inst, User.t) :: deferred_resp
  def create_deferred_update(attrs \\ %{}, version_id, inst, %User{id: user_id}) do
    {type, id} = update_info(inst)
    %DeferredUpdate{user_id: user_id}
    |> DeferredUpdate.changeset(Map.merge(attrs, %{
      "#{type}_installation_id": id,
      version_id: version_id,
      dequeue_at: Timex.now()
    }))
    |> Core.Repo.insert()
  end

  defp update_info(%ChartInstallation{id: id}), do: {:chart, id}
  defp update_info(%TerraformInstallation{id: id}), do: {:terraform, id}

  @doc """
  will mark all pending deferred updates for a user as dequeueable immediately
  """
  @spec kick(User.t) :: {:ok, integer} | error
  def kick(%User{id: user_id}) do
    DeferredUpdate.for_user(user_id)
    |> DeferredUpdate.pending()
    |> Core.Repo.update_all(set: [dequeue_at: Timex.now()])
    |> elem(0)
    |> ok()
  end

  @doc """
  Try to move this deferred update to a users upgrade queue.  Will fail if:
  * the dependencies still aren't valid
  * the user is current delinquent on payments
  * the installation is locked
  """
  @spec deferred_apply(DeferredUpdate.t) :: {:ok, [Upgrade.t]} | deferred_resp
  def deferred_apply(%DeferredUpdate{} = update) do
    %{user: user, version: version} = update =
      Core.Repo.preload(update, [:user, :terraform_installation, :chart_installation, version: [:chart, :terraform]])

    case {Dependencies.valid?(version.dependencies, user), Payments.delinquent?(user), locked?(update)} do
      {true, false, false} ->
        apply_deferred_update(update)
      _ ->
        dequeue = Timex.now() |> Timex.shift(hours: DeferredUpdate.wait_time(update))

        update
        |> Ecto.Changeset.change(%{dequeue_at: dequeue, attempts: update.attempts + 1})
        |> Core.Repo.update()
    end
  end

  defp apply_deferred_update(%DeferredUpdate{version: version} = update) do
    start_transaction()
    |> add_operation(:upgrade, fn _ -> install_version(version, update_inst(update)) end)
    |> add_operation(:clean, fn _ ->
      case Core.Repo.get(DeferredUpdate, update.id) do
        nil -> {:ok, nil}
        update -> Core.Repo.delete(update)
      end
    end)
    |> execute(extract: :clean)
  end

  defp locked?(%{terraform_installation: %{locked: true}}), do: true
  defp locked?(%{chart_installation: %{locked: true}}), do: true
  defp locked?(_), do: false

  @doc """
  Installs a version and either:
  * locks the installation if needed
  * create an upgrade in the users queue if it's not a locking update
  """
  @spec install_version(Version.t, inst) :: {:ok, [Upgrade.t]} | error
  def install_version(version, inst) do
    start_transaction()
    |> add_operation(:lock, fn _ -> Rollouts.lock_installation(version, inst) end)
    |> add_operation(:inst, fn %{lock: inst} ->
      inst
      |> Ecto.Changeset.change(%{version_id: version.id})
      |> Core.Repo.update()
      |> when_ok(&Core.Repo.preload(&1, [:installation]))
    end)
    |> add_operation(:upgrades, fn
      %{inst: %{locked: true}} -> locked_upgrades(version, inst)
      %{inst: inst} -> Core.Rollable.Base.deliver_upgrades(inst.installation.user_id, fn queue ->
        create_upgrade(%{
          repository_id: repo_id(version),
          message: "Upgraded #{type(version)} #{pkg_name(version)} to #{version.version}"
        }, queue)
      end)
    end)
    |> execute(extract: :upgrades)
  end

  defp locked_upgrades(%Version{dependencies: %Deps{dedicated: true}} = version, inst) do
    Core.Rollable.Base.deliver_upgrades(inst.installation.user_id, fn queue ->
      Core.Services.Upgrades.create_upgrade(%{
        type: :dedicated,
        repository_id: repo_id(version),
        message: "Upgraded #{type(version)} #{pkg_name(version)} to #{version.version}"
      }, queue)
    end)
  end
  defp locked_upgrades(_, _), do: {:ok, []}

  defp update_inst(%{chart_installation: %ChartInstallation{} = inst}), do: inst
  defp update_inst(%{terraform_installation: %TerraformInstallation{} = inst}), do: inst

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
