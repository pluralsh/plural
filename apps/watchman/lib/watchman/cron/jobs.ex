defmodule Watchman.Cron.Jobs do
  alias Watchman.Repo
  alias Watchman.Schema.{Build, Invite}

  def prune_builds() do
    Build.expired()
    |> Repo.delete_all()
  end

  def prune_invites() do
    Invite.expired()
    |> Repo.delete_all()
  end
end