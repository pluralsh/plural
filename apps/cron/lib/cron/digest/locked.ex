defmodule Cron.Digest.Locked do
  @moduledoc """
  Wipes invites beyond the expiration time
  """
  use Cron
  import Cron.Digest.Base
  alias Core.Schema.Notification

  def run() do
    Notification.for_type(:locked)
    |> Notification.ordered(asc: :user_id)
    |> Notification.preloaded([:repository])
    |> Core.Repo.all()
    |> grouped(stages: 3)
    |> Flow.map(fn {user, repos} -> Email.Builder.Digest.locked(user, repos) end)
    |> Flow.map(&Core.Email.Mailer.deliver_now/1)
    |> Flow.run()
  end
end
