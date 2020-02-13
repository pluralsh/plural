defmodule Watchman.Deployer do
  use GenServer
  alias Watchman.Commands.Chartmart
  alias Watchman.Services.Builds
  alias Watchman.Schema.Build
  require Logger

  @poll_interval 10_000

  defmodule State, do: defstruct [:storage]

  def start_link(storage) do
    GenServer.start_link(__MODULE__, [storage], name: __MODULE__)
  end

  def init([storage]) do
    if Watchman.conf(:initialize) do
      send self(), :init
      :timer.send_interval @poll_interval, :poll
    end

    {:ok, %State{storage: storage}}
  end

  def wake(), do: GenServer.call(__MODULE__, :poll)

  def handle_call(:poll, _, %State{} = state) do
    send self(), :poll
    {:reply, :ok, state}
  end

  def handle_info(:init, %State{storage: storage} = state) do
    storage.init()
    {:noreply, state}
  end

  def handle_info(:poll, %State{storage: storage} = state) do
    Logger.info "Checking for pending builds"
    case Builds.poll() do
      nil -> {:noreply, state}
      %Build{} = build ->
        perform(storage, build) |> log()
        {:noreply, state}
    end
  end

  defp perform(storage, %Build{repository: repo} = build) do
    with {:ok, _} <- Builds.running(build),
         :ok <- storage.init(),
         :ok <- Chartmart.build(repo),
         :ok <- Chartmart.deploy(repo),
         :ok <- storage.revise("watchman deployment for #{repo}"),
         :ok <- storage.push() do
      Builds.succeed(build)
    else
      _ -> Builds.fail(build)
    end
  end

  defp log({:error, error}) do
    Logger.info "Failed to deploy, error: #{error}"
  end
  defp log(_), do: :ok
end