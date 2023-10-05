defmodule RtcWeb.ShellChannel do
  use RtcWeb, :channel
  alias Core.Services.{Shell.Pods, Shell}
  alias Core.Schema.{CloudShell}

  require Logger

  def join("shells:me", _, socket) do
    with %CloudShell{pod_name: name} = shell <- Shell.get_shell(socket.assigns.user.id),
         {:ok, socket} <- available(shell, socket),
         {:ok, pid} <- exec_pod(name, socket) do
      {:ok, assign(socket, :wss_pid, pid)}
    else
      err ->
        Logger.info "failed to exec pod with #{inspect(err)}"
        {:error, %{reason: format(err)}}
    end
  end

  def handle_info({:stdo, data}, socket) do
    push(socket, "stdo", %{message: Base.encode64(data)})
    {:noreply, socket}
  end

  def handle_in("command", %{"cmd" => cmd}, socket) do
    Pods.PodExec.command(socket.assigns.wss_pid, fmt_cmd(cmd))
    {:reply, :ok, socket}
  end

  def handle_in("resize", %{"width" => w, "height" => h}, socket) do
    Pods.PodExec.resize(socket.assigns.wss_pid, w, h)
    {:reply, :ok, socket}
  end

  defp exec_pod(_, %{assigns: %{wss_pid: pid}}) when is_pid(pid), do: {:ok, pid}
  defp exec_pod(name, _) do
    Pods.PodExec.exec_url(name)
    |> Pods.PodExec.start_link(self())
  end

  defp available(%CloudShell{owner_pid: pid}, %{assigns: %{owner_pid: pid}} = socket), do: {:ok, socket}
  defp available(%CloudShell{owner_pid: {_, _} = pid} = shell, socket) do
    case alive?(pid) do
      true -> "cloud shell already taken by another window"
      _ -> write_pid(shell, socket)
    end
  end
  defp available(%CloudShell{} = shell, socket), do: write_pid(shell, socket)

  defp me(), do: {node(), self()}

  defp write_pid(%CloudShell{} = shell, socket)  do
    CloudShell.pid_changeset(shell, %{owner_pid: me()})
    |> Core.Repo.update()
    |> case do
      {:ok, %CloudShell{owner_pid: pid}} -> {:ok, assign(socket, :owner_pid, pid)}
      error -> error
    end
  end

  defp alive?({:nonode@nohost, pid}), do: Process.alive?(pid)
  defp alive?({node, pid}) do
    case Node.ping(node) do
      :pong -> :rpc.call(node, Process, :alive?, [pid])
      _ -> false
    end
  end

  defp fmt_cmd(cmd) when is_binary(cmd), do: cmd
  defp fmt_cmd(cmd) when is_list(cmd), do: Enum.join(cmd, " ")

  defp format(err) when is_binary(err), do: err
  defp format({:error, err}), do: "error: #{inspect(err)}"
  defp format(err), do: inspect(err)
end
