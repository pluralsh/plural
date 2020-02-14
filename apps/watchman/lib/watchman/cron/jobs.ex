defmodule Watchman.Cron.Jobs do
  alias Watchman.Schema.Build

  def prune_builds() do
    Build.expired()
    |> Watchman.Repo.delete_all()
  end
end