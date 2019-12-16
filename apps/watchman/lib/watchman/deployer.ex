defmodule Watchman.Deployer do
  use GenServer
  alias Watchman.Chartmart
  require Logger

  defmodule State, do: defstruct [:storage]

  def start_link(storage) do
    GenServer.start_link(__MODULE__, [storage], name: __MODULE__)
  end

  def init([storage]) do
    {:ok, %State{storage: storage}}
  end

  def deploy(repo), do: GenServer.cast(__MODULE__, {:deploy, repo})

  def deploy_sync(repo), do: GenServer.call(__MODULE__, {:deploy, repo}, :infinity)

  def handle_cast({:deploy, repo}, %State{storage: storage} = state) do
    case perform(storage, repo) do
      :ok -> :ok
      {:error, _} = error -> Logger.error "Failed to deploy: #{inspect(error)}"
    end
    {:noreply, state}
  end

  def handle_call({:deploy, repo}, _, %State{storage: storage} = state),
    do: {:reply, perform(storage, repo), state}

  defp perform(storage, repo) do
    with :ok <- storage.init(),
         :ok <- Chartmart.build(repo),
         :ok <- Chartmart.deploy(repo),
         :ok <- storage.revise("watchman deployment for #{repo}"),
      do: storage.push()
  end
end