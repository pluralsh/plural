defmodule Cron.Prune.Notifications do
  @moduledoc """
  Wipes invites beyond the expiration time
  """
  use Cron
  alias Core.Schema.Notification

  def run() do
    Notification.expired()
    |> Core.Repo.delete_all()
  end
end
