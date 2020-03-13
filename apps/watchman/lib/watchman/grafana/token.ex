defmodule Watchman.Grafana.Token do
  use GenServer

  @refresh_interval 60 * 1000

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  def init(:ok) do
    send self(), :refetch
    :timer.send_interval(@refresh_interval, :refetch)
    {:ok, nil}
  end

  def fetch(), do: GenServer.call(__MODULE__, :fetch)

  def handle_call(:fetch, _, state),
    do: {:reply, state, state}

  def handle_info(:refetch, _),
    do: {:noreply, fetch_credentials()}

  def handle_info(_, state), do: {:noreply, state}

  def fetch_credentials() do
    Kazan.Apis.Core.V1.read_namespaced_secret!("bootstrap", "grafana-credentials")
    |> Kazan.run()
    |> case do
      {:ok, %Kazan.Apis.Core.V1.Secret{data: %{"admin-user" => userb64, "admin-password" => pwdb64}}} ->
        {Base.decode64!(userb64), Base.decode64!(pwdb64)}
      _ -> {"", ""}
    end
  end
end