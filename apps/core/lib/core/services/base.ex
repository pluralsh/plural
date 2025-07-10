defmodule Core.Services.Base do
  alias Core.Schema.User

  defmacro __using__(_) do
    quote do
      import Core.Services.Base
      alias Core.Repo

      defp conf(key),
        do: Application.get_env(:core, __MODULE__)[key]
    end
  end

  def find_bindings(%User{service_account: true} = user) do
    case Core.Repo.preload(user, impersonation_policy: :bindings) do
      %{impersonation_policy: %{bindings: [_ | _] = bindings}} ->
        Enum.map(bindings, &Map.take(&1, [:group_id, :user_id]))
      _ -> []
    end
  end
  def find_bindings(%User{id: id}), do: [%{user_id: id}]
  def find_bindings(_), do: []

  def ok(val), do: {:ok, val}

  def error(val), do: {:error, val}

  def start_transaction(), do: Ecto.Multi.new()

  def short_circuit(), do: []

  def short(circuit, name, fun) when is_list(circuit) and is_function(fun),
    do: [{name, fun} | circuit]

  def add_operation(multi, name, fun) when is_function(fun) do
    Ecto.Multi.run(multi, name, fn _, params ->
      fun.(params)
    end)
  end

  def execute(operation, opts \\ [])

  def execute(circuit, _) when is_list(circuit) do
    Enum.reverse(circuit)
    |> execute_short_circuit(%{})
  end

  def execute(%Ecto.Multi{} = multi, opts) do
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

  defp execute_short_circuit([], result), do: {:ok, result}
  defp execute_short_circuit([{name, fun} | rest], result) do
    case fun.() do
      {:ok, res} -> execute_short_circuit(rest, Map.put(result, name, res))
      {:error, _} = error -> error
    end
  end

  def handle_notify(event_type, resource, additional \\ %{}) do
    Map.new(additional)
    |> Map.put(:item, resource)
    |> Map.put(:context, Core.Services.Audits.context())
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
