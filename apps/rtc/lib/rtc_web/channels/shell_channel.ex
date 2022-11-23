defmodule RtcWeb.ShellChannel do
  use RtcWeb, :channel
  alias Core.Services.{Shell.Pods, Shell}
  alias Core.Shell.Client
  alias Core.Schema.CloudShell

  require Logger

  def join("shells:me", _, socket) do
    with %CloudShell{pod_name: name} = shell <- Shell.get_shell(socket.assigns.user.id),
         {:ok, _} <- Client.setup(shell),
         url <- Pods.PodExec.exec_url(name),
         {:ok, pid} <- Pods.PodExec.start_link(url, self()) do
      {:ok, assign(socket, :wss_pid, pid)}
    else
      err ->
        Logger.info "failed to exec pod with #{inspect(err)}"
        {:error, %{reason: inspect(err)}}
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

  defp fmt_cmd(cmd) when is_binary(cmd), do: cmd
  defp fmt_cmd(cmd) when is_list(cmd), do: Enum.join(cmd, " ")
end
