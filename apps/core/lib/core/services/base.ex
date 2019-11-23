defmodule Core.Services.Base do
  defmacro __using__(_) do
    quote do
      import Core.Services.Base
    end
  end

  def start_transaction(), do: Ecto.Multi.new()

  def add_operation(multi, name, fun) when is_function(fun) do
    Ecto.Multi.run(multi, name, fn _, params ->
      fun.(params)
    end)
  end

  def execute(multi, opts \\ []) do
    with {:ok, result} <- Core.Repo.transaction(multi) do
      case Map.new(opts) do
        %{extract: operation} -> {:ok, result[operation]}
        _ -> {:ok, result}
      end
    else
      {:error, _, reason, _} -> {:error, reason}
      {:error, reason} -> {:error, reason}
    end
  end

  def ok(res), do: {:ok, res}

  def handle_notify(event_type, resource, additional \\ %{}) do
    Map.new(additional)
    |> Map.put(:item, resource)
    |> event_type.__struct__()
    |> Core.PubSub.Broadcaster.notify()
    |> case do
      :ok   -> {:ok, resource}
      _error -> {:error, :internal_error}
    end
  end

  def when_ok({:ok, resource}, :insert), do: Core.Repo.insert(resource)
  def when_ok({:ok, resource}, :update), do: Core.Repo.update(resource)
  def when_ok({:ok, resource}, :delete), do: Core.Repo.delete(resource)
  def when_ok({:ok, resource}, fun) when is_function(fun) do
    case fun.(resource) do
      {:ok, res} -> {:ok, res}
      {:error, error} -> {:error, error}
      res -> {:ok, res}
    end
  end
  def when_ok(error, _), do: error

  def timestamped(map) do
    map
    |> Map.put(:inserted_at, DateTime.utc_now())
    |> Map.put(:updated_at, DateTime.utc_now())
  end

  defmacro stringish_fetch(map, atom_key) do
    string_key = Atom.to_string(atom_key)
    quote do
      case unquote(map) do
        %{unquote(atom_key) => val} -> val
        %{unquote(string_key) => val} -> val
        _ -> nil
      end
    end
  end
end