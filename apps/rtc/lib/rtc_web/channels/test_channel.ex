defmodule RtcWeb.TestChannel do
  use RtcWeb, :channel
  alias Core.Schema.Test
  alias Core.Policies.Test, as: TestPolicy
  alias Core.Services.Tests
  alias Rtc.TestWatcher
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
    case socket.assigns do
      %{publishable: true, test_logger: logger} ->
        broadcast!(socket, "stdo", %{line: line, step: step})
        TestWatcher.add_line(logger, step, line)
        {:reply, :ok, socket}
      _ -> {:reply, {:error, :forbidden}, socket}
    end
  end

  defp hydrate_socket(socket, %Test{} = test) do
    TestPolicy.allow(test, socket.assigns.user, :edit)
    |> case do
      {:ok, _} -> assign(socket, :publishable, true)
      _ -> assign(socket, :publishable, false)
    end
    |> assign(:test, test)
    |> start_logger()
  end

  defp start_logger(%{assigns: %{user: user, test: test, publishable: true}} = socket) do
    {:ok, logger} = TestWatcher.start(self(), test, user)
    assign(socket, :test_logger, logger)
  end
  defp start_logger(socket), do: socket
end
