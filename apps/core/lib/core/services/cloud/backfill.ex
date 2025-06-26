defmodule Core.Services.Cloud.Backfill do
  alias Core.Repo
  alias Core.Schema.ConsoleInstance
  alias Core.Services.Cloud.Workflow.Shared
  require Logger

  def run() do
    ConsoleInstance.for_type(:shared)
    |> ConsoleInstance.stream()
    |> Repo.stream(method: :keyset)
    |> Stream.each(fn inst ->
      Logger.info("Syncing instance #{inst.name}")
      Shared.sync(inst)
    end)
    |> Stream.run()
  end
end
