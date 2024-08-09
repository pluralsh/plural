defmodule Core.Services.Cloud.Poller do
  use GenServer
  alias Core.Clients.Console
  alias Core.Services.Cloud
  require Logger

  @poll :timer.minutes(2)

  defmodule State, do: defstruct [:client, :repo]

  def start_link(_) do
    GenServer.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  def init(_) do
    :timer.send_interval(@poll, :clusters)
    :timer.send_interval(@poll, :pgs)
    send self(), :repo
    {:ok, %State{client: Console.new(Core.conf(:console_url), Core.conf(:console_token))}}
  end

  def repository(), do: GenServer.call(__MODULE__, :repo)

  def handle_call(:repo, _, %{repo: id} = state) when is_binary(id),
    do: {:reply, {:ok, id}, state}
  def handle_call(:repo, _, state), do: {:reply, {:error, "repo not pulled"}, state}

  def handle_info(:repo, %{client: client} = state) do
    case Console.repo(client, Core.conf(:mgmt_repo)) do
      {:ok, id} -> {:noreply, %{state | repo: id}}
      err ->
        Logger.warn "failed to find mgmt repo: #{inspect(err)}"
        {:noreply, state}
    end
  end

  def handle_info(:clusters, %{client: client} = state) do
    with {:ok, clusters} <- Console.clusters(client) do
      Enum.each(clusters, &upsert_cluster/1)
    end

    {:noreply, state}
  end

  def handle_info(:pgs, %{client: client} = state) do
    with {:ok, stack} <- Console.stack(client, Core.conf(:stack_id)),
         %{"value" => v} <- Enum.find(stack["output"], & &1["name"] == "clusters"),
         {:ok, pgs} <- Jason.decode(v) do
      Enum.each(pgs, fn {k, v} -> upsert_pg(k, v) end)
    else
      err -> Logger.warn "failed to fetch cluster info: #{inspect(err)}"
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
    |> log_err("failed to insert cloud cluster")
  end

  defp upsert_pg(name, pg) do
    Cloud.upsert_postgres(%{
      cloud: pg["cloud"],
      url: pg["url"],
      # certificate: pg["certificate"],
      host: pg["host"]
    }, name)
    |> log_err("failed to insert postgres cluster")
  end

  defp to_cloud("EKS"), do: :aws
  defp to_cloud("GKE"), do: :gcp
  defp to_cloud("AKS"), do: :azure
  defp to_cloud(_), do: :aws

  defp log_err({:error, _} = err, msg), do: "#{msg}: #{inspect(err)}"
  defp log_err(pass, _), do: pass
end
