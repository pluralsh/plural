defmodule Cron.Prune.Invites do
  @moduledoc """
  Wipes invites beyond the expiration time
  """
  use Cron
  alias Core.Schema.Invite

  def run() do
    Invite.expired()
    |> Core.Repo.delete_all()
  end
end
