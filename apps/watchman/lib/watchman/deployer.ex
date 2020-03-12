defmodule Watchman.Deployer do
  use GenServer
  alias Watchman.Commands.{Forge, Command}
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

  def update(repo, content), do: GenServer.call(__MODULE__, {:update, repo, content})

  def handle_call(:poll, _, %State{} = state) do
    send self(), :poll
    {:reply, :ok, state}
  end

  def handle_call({:update, repo, content}, _, %State{storage: storage} = state) do
    {:reply, update(storage, repo, content), state}
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

  def handle_info(_, state), do: {:noreply, state}

  defp perform(storage, %Build{repository: repo, type: :bounce} = build) do
    with_build(build, fn ->
      with {:ok, _} <- storage.init(),
        do: Forge.bounce(repo)
    end)
  end

  defp perform(storage, %Build{repository: repo, message: message} = build) do
    with_build(build, fn ->
      with {:ok, _} <- storage.init(),
           {:ok, _} <- Forge.build(repo),
           {:ok, _} <- Forge.deploy(repo),
           {:ok, _} <- storage.revise(commit_message(message, repo)),
        do: storage.push()
    end)
  end

  defp update(storage, repo, content) do
    Command.set_build(nil)
    with {:ok, _} <- storage.init(),
         {:ok, res} <- Watchman.Services.Forge.update_configuration(repo, content),
         {:ok, _} <- storage.revise("updated configuration for #{repo}"),
         {:ok, _} <- storage.push(),
      do: {:ok, res}
  end

  defp with_build(%Build{} = build, fun) when is_function(fun) do
    Command.set_build(build)
    with {:ok, _} <- Builds.running(build),
         {:ok, _} <- fun.() do
      Builds.succeed(build)
    else
      _ -> Builds.fail(build)
    end
  end

  defp commit_message(nil, repo), do: "watchman deployment for #{repo}"
  defp commit_message(message, repo), do: "watchman deployment for #{repo} -- #{message}"

  defp log({:error, error}), do: Logger.info "Failed to deploy, error: #{inspect(error)}"
  defp log(_), do: :ok
end