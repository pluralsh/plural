defmodule Core.Retry do
  require Logger

  defstruct [wait: 200, attempts: 0, max: 3]

  def retry(fun, args) when is_function(fun) and (is_list(args) or is_map(args)) do
    struct(__MODULE__, Map.new(args))
    |> retry(fun)
  end

  def retry(%__MODULE__{attempts: attempts, max: max, wait: wait} = conf, fun) do
    case {attempts < max, fun.()} do
      {_, :ok} -> :ok
      {_, {:ok, res}} -> {:ok, res}
      {true, {:error, _} = error} ->
        Logger.info "failed to execute function, error: #{inspect(error)}"
        :timer.sleep(wait)
        retry(%{conf | attempts: attempts + 1}, fun)
      {_, {:error, err}} -> {:error, err}
    end
  end
end
