defmodule Rtc.TestWatcher do
  use GenServer
  require Logger
  alias Rtc.TestLogger

  defmodule State, do: defstruct [:ref, :logger, :test, :user]

  def start(pid, test, user) do
    GenServer.start(__MODULE__, {pid, test, user})
  end

  def init({pid, test, user}) do
    ref = Process.monitor(pid)
    {:ok, %State{ref: ref, logger: TestLogger.new(), test: test, user: user}}
  end

  def add_line(pid, step, line) do
    GenServer.call(pid, {:log, step, line})
  end

  def handle_call({:log, step, line}, _, %State{logger: logger} = state) do
    logger = TestLogger.add_line(logger, step, line)
    {:reply, :ok, %{state | logger: logger}}
  end

  def handle_info({:DOWN, _, :process, _, _}, %State{logger: logger, test: test, user: user} = state) do
    res = TestLogger.flush(logger, test, user)
    Logger.info "Flush result: #{inspect(res)}"
    {:stop, {:shutdown, :normal}, state}
  end

  def handle_info(_, state), do: {:noreply, state}
end
