defmodule Core.Services.Upgrades do
  use Core.Services.Base
  alias Core.Schema.{User, UpgradeQueue, Upgrade}
  alias Core.PubSub

  def create_queue(%User{} = user) do
    %UpgradeQueue{user_id: user.id}
    |> UpgradeQueue.changeset()
    |> Core.Repo.insert()
  end

  def create_upgrade(params, %User{} = user) do
    %{queue: queue} = Core.Repo.preload(user, [:queue])

    %Upgrade{queue_id: queue.id}
    |> Upgrade.changeset(params)
    |> Core.Repo.insert()
    |> notify(:create)
  end

  def next(%UpgradeQueue{acked: acked}) do
    Upgrade.after_seq(acked)
    |> Upgrade.ordered()
    |> Upgrade.limit(1)
    |> Core.Repo.one()
    |> Core.Repo.preload([:repository])
  end

  def ack(id, %UpgradeQueue{acked: nil} = q) do
    Ecto.Changeset.change(q, %{acked: id})
    |> Core.Repo.update()
  end

  def ack(id, %UpgradeQueue{acked: last}) when last > id, do: {:error, :invalid_ack}

  def ack(id, %UpgradeQueue{} = q) do
    Ecto.Changeset.change(q, %{acked: id})
    |> Core.Repo.update()
  end

  defp notify({:ok, %Upgrade{} = upgrade}, :create),
    do: handle_notify(PubSub.UpgradeCreated, upgrade)

  defp notify(pass, _), do: pass
end
