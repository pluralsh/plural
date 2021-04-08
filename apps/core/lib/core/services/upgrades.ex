defmodule Core.Services.Upgrades do
  use Core.Services.Base
  alias Core.Schema.{User, UpgradeQueue, Upgrade}
  alias Core.PubSub

  def get_queue(id), do: Core.Repo.get(UpgradeQueue, id)

  def get_queue(user_id, name), do: Core.Repo.get_by(UpgradeQueue, user_id: user_id, name: name)

  def authorize(id, %User{id: user_id}) do
    case get_queue(id) do
      %UpgradeQueue{user_id: ^user_id} = q -> {:ok, q}
      _ -> {:error, :unauthorized}
    end
  end

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
    |> add_operation(:user, fn %{queue: q} ->
      update_default_queue(q, user)
    end)
    |> execute(extract: :queue)
    |> notify(:upsert, queue)
  end

  def update_default_queue(%UpgradeQueue{id: id}, %User{default_queue_id: nil} = user) do
    Ecto.Changeset.change(user, %{default_queue_id: id})
    |> Core.Repo.update()
  end
  def update_default_queue(_, %User{} = user), do: {:ok, user}

  def create_upgrade(params, %User{} = user) do
    %{queue: queue} = Core.Repo.preload(user, [:queue])
    create_upgrade(params, queue)
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
