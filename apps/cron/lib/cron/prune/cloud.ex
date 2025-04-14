defmodule Cron.Prune.Cloud do
  @moduledoc """
  Reaps unpaid cloud consoles
  """
  use Cron
  alias Core.Schema.{ConsoleInstance}
  alias Core.Services.Cloud

  def run() do
    ConsoleInstance.unpaid()
    |> ConsoleInstance.reapable()
    |> ConsoleInstance.ordered(asc: :id)
    |> Core.Repo.stream(method: :keyset)
    |> Core.throttle()
    |> Enum.each(fn inst ->
      Logger.info("Reaping cloud console #{inst.id}")
      Cloud.reap(inst)
      |> log_error()
    end)
  end

  defp log_error({:ok, _}), do: :ok
  defp log_error(err) do
    Logger.error("Error reaping cloud console: #{inspect(err)}")
  end
end
