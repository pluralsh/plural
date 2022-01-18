defmodule Core.Services.Shell.Pods.PodExec do
  use WebSockex

  defmodule State, do: defstruct [:pid]

  def exec_url(name) do
    args = URI.encode_query(%{
      container: "server",
      command: "zsh",
      tty: "true",
      stdin: "true",
      stdout: "true",
      stderr: "true"
    })

    "/api/v1/namespaces/plrl-shell/pods/#{name}/exec?#{args}"
  end

  def start_link(path, pid, %{url: "https://" <> url, ca_cert: cert, auth: auth}) do
    WebSockex.start_link("wss://#{url}#{path}", __MODULE__, %State{pid: pid}, [
      extra_headers: [{"Authorization", "Bearer #{auth.token}"}],
      cacerts: [cert]
    ])
  end
  def start_link(path, pid), do: start_link(path, pid, Kazan.Server.in_cluster())

  def handle_info(:ping, state) do
    {:reply, {:binary, <<0>>}, state}
  end

  def handle_frame({:binary, frame}, %{pid: pid} = state) do
    deliver_frame(frame, pid)
    {:ok, state}
  end

  def command(client, message) do
    WebSockex.send_frame(client, {:binary, <<0>> <> message})
  end

  def resize(client, cols, rows) do
    resize = Jason.encode!(%{Width: cols, Height: rows})
    WebSockex.send_frame(client, {:binary, <<4>> <> resize})
  end

  defp deliver_frame(<<1, frame::binary>>, pid),
    do: send_frame(pid, frame)
  defp deliver_frame(<<2, frame::binary>>, pid),
    do: send_frame(pid, frame)
  defp deliver_frame(<<3, frame::binary>>, pid),
    do: send_frame(pid, frame)
  defp deliver_frame(frame, pid), do: send_frame(pid, frame)

  defp send_frame(pid, frame), do: send(pid, {:stdo, frame})
end
