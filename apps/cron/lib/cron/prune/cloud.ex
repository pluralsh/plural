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
    |> Enum.each(&Cloud.reap/1)
  end
end
