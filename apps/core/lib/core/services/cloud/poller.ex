defmodule Core.Services.Cloud.Poller do
  use GenServer
  alias Core.Clients.Console
  alias Core.Services.Cloud
  alias Kazan.Apis.Core.V1, as: CoreV1

  @poll :timer.minutes(5)

  defmodule State, do: defstruct [:client, :repo]

  def start_link(_) do
    GenServer.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  def init(_) do
    :timer.send_interval(@poll, :clusters)
    :timer.send_interval(@poll, :roaches)
    send self(), :repo
    {:ok, %State{client: Console.new(Core.conf(:console_url), Core.conf(:console_token))}}
  end

  def repository(), do: GenServer.call(__MODULE__, :repo)

  def handle_call(:repo, %{repo: id} = state) when is_binary(id),
    do: {:reply, {:ok, id}, state}
  def handle_call(:repo, state), do: {:reply, {:error, "repo not pulled"}, state}

  def handle_info(:repo, %{client: client} = state) do
    case Console.repo(client, Core.conf(:mgmt_repo)) do
      {:ok, id} -> {:noreply, %{state | repo: id}}
      _ -> {:noreply, state}
    end
  end

  def handle_info(:clusters, %{client: client} = state) do
    with {:ok, clusters} <- Console.clusters(client) do
      Enum.each(clusters, &upsert_cluster/1)
    end

    {:noreply, state}
  end

  def handle_info(:roaches, state) do
    with {:ok, roaches} <- read_secret() do
      Enum.each(roaches, &upsert_roach/1)
    end
    {:noreply, state}
  end

  def handle_info(_, state), do: {:noreply, state}

  defp upsert_cluster(%{"id" => id, "name" => name, "distro" => distro, "metadata" => meta}) do
    Cloud.upsert_cluster(%{
      external_id: id,
      cloud: to_cloud(distro),
      region: meta["region"]
    }, name)
  end

  defp upsert_roach(%{"name" => name} = roach) do
    Cloud.upsert_cockroach(%{
      cloud: roach["cloud"],
      url: roach["url"],
      certificate: roach["certificate"],
      endpoints: roach["endpoints"]
    }, name)
  end

  defp read_secret() do
    CoreV1.read_namespaced_secret!("plural", "plrl-cloud-config")
    |> Kazan.run()
    |> case do
      {:ok, %CoreV1.Secret{data: %{"cockroaches" => roaches}}} ->
        Jason.decode(roaches)
      _ -> {:error, "could not find secret"}
    end
  end

  defp to_cloud("EKS"), do: :aws
  defp to_cloud("GKE"), do: :gcp
  defp to_cloud("AKS"), do: :azure
  defp to_cloud(_), do: :aws
end
