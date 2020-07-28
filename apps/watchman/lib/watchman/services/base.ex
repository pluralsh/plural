defmodule Watchman.Services.Base do
  alias Watchman.GraphQl.Topic

  defmacro __using__(_) do
    quote do
      import Watchman.Services.Base
      alias Watchman.Repo
    end
  end

  def start_transaction(), do: Ecto.Multi.new()

  def add_operation(multi, name, fun) when is_function(fun) do
    Ecto.Multi.run(multi, name, fn _, params ->
      fun.(params)
    end)
  end

  def execute(%Ecto.Multi{} = multi, opts \\ []) do
    with {:ok, result} <- Watchman.Repo.transaction(multi) do
      case Map.new(opts) do
        %{extract: operation} -> {:ok, result[operation]}
        _ -> {:ok, result}
      end
    else
      {:error, _, reason, _} -> {:error, reason}
      {:error, reason} -> {:error, reason}
    end
  end

  def broadcast(resource, delta) do
    topic = Topic.infer(resource, delta)
    :ok = Absinthe.Subscription.publish(
      WatchmanWeb.Endpoint,
      %{payload: resource, delta: delta},
      topic
    )
    resource
  end

  def when_ok({:ok, resource}, :insert), do: Watchman.Repo.insert(resource)
  def when_ok({:ok, resource}, :update), do: Watchman.Repo.update(resource)
  def when_ok({:ok, resource}, :delete), do: Watchman.Repo.delete(resource)
  def when_ok({:ok, resource}, fun) when is_function(fun) do
    case fun.(resource) do
      {:ok, res} -> {:ok, res}
      {:error, error} -> {:error, error}
      res -> {:ok, res}
    end
  end
  def when_ok(error, _), do: error

  def handle_notify(event_type, resource, additional \\ %{}) do
    Map.new(additional)
    |> Map.put(:item, resource)
    |> event_type.__struct__()
    |> Watchman.PubSub.Broadcaster.notify()
    |> case do
      :ok   -> {:ok, resource}
      _error -> {:error, :internal_error}
    end
  end
end