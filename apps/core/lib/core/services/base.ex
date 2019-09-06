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

  def when_ok({:ok, resource}, :insert), do: Core.Repo.insert(resource)
  def when_ok({:ok, resource}, :update), do: Core.Repo.update(resource)
  def when_ok({:ok, resource}, :delete), do: Core.Repo.delete(resource)
  def when_ok({:ok, resource}, fun) when is_function(fun), do: {:ok, fun.(resource)}
  def when_ok(error, _), do: error

  def timestamped(map) do
    map
    |> Map.put(:inserted_at, DateTime.utc_now())
    |> Map.put(:updated_at, DateTime.utc_now())
  end
end