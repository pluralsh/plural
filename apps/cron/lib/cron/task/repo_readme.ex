defmodule Cron.Task.RepoReadme do
  @moduledoc """
  Backfills all repository readmes
  """
  use Cron

  def run() do
    Core.Repo.all(Core.Schema.Repository)
    |> Core.throttle()
    |> Enum.map(&Core.Services.Repositories.hydrate/1)
    |> log()
  end
end
