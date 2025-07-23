defmodule RtcWeb.UpgradeChannel do
  use RtcWeb, :channel
  alias Rtc.UpgradeBuffer
  alias Core.Schema.{Upgrade, Cluster}
  alias Core.Services.{Upgrades, Clusters}
  require Logger

  @ping_interval 60 * 1000

  intercept ["new_upgrade"]

  def join("queues:" <> id, _params, socket) do
    send(self(), {:authorize, id})
    {:ok, socket}
  end

  def join("upgrades:" <> id, _params, socket) do
    send(self(), :after_join)
    {:ok, assign(socket, :upgrade_user, id)}
  end

  def handle_info({:authorize, id}, socket) do
    user = socket.assigns.user
    case Core.Services.Upgrades.authorize(id, user) do
      {:ok, queue} ->
        :timer.send_interval(@ping_interval, :ping)

        socket =
          assign(socket, :queue, queue)
          |> assign(:user, user)
          |> assign(:buffer, UpgradeBuffer.new())
        {:noreply, socket}

      _ ->
        {:stop, {:shutdown, :unauthorized}, socket}
    end
  end

  def handle_info(:after_join, socket) do
    user = socket.assigns.user
    with true <- socket.assigns.upgrade_user == user.id,
         %{queue: queue} = user <- Core.Repo.preload(user, [:queue]) do
      socket =
        assign(socket, :queue, queue)
        |> assign(:user, user)
        |> assign(:buffer, UpgradeBuffer.new())
      {:noreply, socket}
    else
      _ -> {:stop, {:shutdown, :unauthorized}, socket}
    end
  end

  def handle_info(:ping, socket) do
    case Upgrades.ping(socket.assigns.queue) do
      {:ok, q} -> {:noreply, assign(socket, :queue, q)}
      _ -> {:noreply, socket}
    end
  end

  def handle_info(_, socket), do: {:noreply, socket}

  def handle_in("next", _, socket) do
    case Upgrades.next(socket.assigns.queue) do
      %Upgrade{} = up -> {:reply, {:ok, up}, socket}

      _ -> {:reply, {:error, :none}, socket}
    end
  end

  def handle_in("usage", attrs, socket) do
    case Core.Repo.preload(socket.assigns.queue, [:cluster]) do
      %{cluster: %Cluster{} = cluster} = queue ->
        Logger.info("usage event found for user #{socket.assigns.user.email}: #{inspect(attrs)}")
        Clusters.save_usage(attrs, cluster)
        maybe_meter(socket.assigns.user, attrs)
        {:reply, :ok, assign(socket, :queue, queue)}
      _ -> {:reply, {:error, "no cluster found"}, socket}
    end
  end

  def handle_in("ack", %{"id" => id}, socket) do
    case Upgrades.ack(id, socket.assigns.queue) do
      {:ok, q} ->
        {:reply, :ok, assign(socket, :queue, q)}

      _ ->
        {:reply, :error, socket}
    end
  end

  def handle_out("new_upgrade", upgrade, socket) do
    buf = UpgradeBuffer.append(socket.assigns.buffer, upgrade)
    flush_buffer(socket, upgrade.id)
    socket = assign(socket, :buffer, buf)
    {:noreply, socket}
  end

  defp flush_buffer(socket, id) do
    case socket.assigns.buffer do
      %{last: last} when is_nil(last) or id > last ->
        push(socket, "more", %{"target" => id})
      _ -> :ok
    end
  end

  defp maybe_meter(user, %{"bytes_ingested" => bytes}) do
    Core.Services.Payments.defer_ingest(user, bytes)
  end
  defp maybe_meter(_, _), do: :ok
end
