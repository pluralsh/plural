defmodule RtcWeb.TestChannel do
  use RtcWeb, :channel
  alias Core.Schema.Test
  alias Core.Policies.Test, as: TestPolicy
  alias Core.Services.Tests
  alias Rtc.TestLogger
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
        logger = TestLogger.add_line(logger, step, line)
        {:reply, :ok, assign(socket, :test_logger, logger)}
      _ -> {:reply, {:error, :forbidden}, socket}
    end
  end

  def terminate(%{assigns: %{test_logger: logger, test: test, user: user, publishable: true}}, _) do
    res = TestLogger.flush(logger, test, user)
    Logger.info "Flush result: #{inspect(res)}"
  end
  def terminate(_, _), do: :ok

  defp hydrate_socket(socket, %Test{} = test) do
    TestPolicy.allow(test, socket.assigns.user, :edit)
    |> case do
      {:ok, _} -> assign(socket, :publishable, true)
      _ -> assign(socket, :publishable, false)
    end
    |> assign(:test_logger, TestLogger.new())
    |> assign(:test, test)
  end
end
