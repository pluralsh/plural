defmodule RtcWeb.TestChannel do
  use RtcWeb, :channel
  alias Core.Schema.Test
  alias Core.Policies.Test, as: TestPolicy
  alias Core.Services.Tests
  require Logger

  def join("tests:" <> id, _, socket) do
    send(self(), {:connect, id})
    {:ok, socket}
  end

  def handle_info({:connect, id}, socket) do
    case Tests.get_test(id) do
      %Test{} = test -> {:noreply, hydrate_socket(socket, test)}
      _ -> {:stop, {:shutdown, :not_found}, socket}
    end
  end

  def handle_in("stdo", %{"line" => line, "step" => step}, socket) do
    Logger.info "received log line"
    case socket.assigns.publishable do
      true ->
        broadcast!(socket, "stdo", %{line: line, step: step})
        {:reply, :ok, socket}
      _ -> {:reply, {:error, :forbidden}, socket}
    end
  end

  defp hydrate_socket(socket, %Test{} = test) do
    case TestPolicy.allow(test, socket.assigns.user, :edit) do
      {:ok, _} -> assign(socket, :publishable, true)
      _ -> assign(socket, :publishable, false)
    end
  end
end
