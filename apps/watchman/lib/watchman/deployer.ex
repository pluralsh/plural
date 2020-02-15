defmodule Watchman.Deployer do
  use GenServer
  alias Watchman.Commands.{Chartmart, Command}
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
        Command.set_build(build)
        perform(storage, build) |> log()
        {:noreply, state}
    end
  end

  defp perform(storage, %Build{repository: repo, message: message} = build) do
    with {:ok, _} <- Builds.running(build),
         {:ok, _} <- storage.init(),
         {:ok, _} <- Chartmart.build(repo),
         {:ok, _} <- Chartmart.deploy(repo),
         {:ok, _} <- storage.revise(commit_message(message, repo)),
         {:ok, _} <- storage.push() do
      Builds.succeed(build)
    else
      _ -> Builds.fail(build)
    end
  end

  defp commit_message(nil, repo), do: "watchman deployment for #{repo}"
  defp commit_message(message, repo), do: "watchman deployment for #{repo} -- #{message}"

  defp log({:error, error}) do
    Logger.info "Failed to deploy, error: #{inspect(error)}"
  end
  defp log(_), do: :ok
end