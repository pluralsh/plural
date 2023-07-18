defmodule Cron.Digest.Base do
  alias Core.Schema.{Notification, User, Repository}

  @doc """
  Groups the digested notifications first by user then by repository.  After that compiles each repo group into a map
  like:

    repo -> count

  where count is the number of notifications for that repo.  This can then be sent along the chain to future digest
  emails.
  """
  @spec grouped([Notification.t]) :: Flow.t
  def grouped(notifications, opts \\ []) do
    Flow.from_enumerable(notifications, opts)
    |> Flow.group_by(& &1.user_id)
    |> Flow.map(fn {user_id, notifs} ->
      notif_groups = Enum.group_by(notifs, & &1.repository_id)
      compile(user_id, notif_groups)
    end)
  end

  @doc """
  Compiles information about a notification group into a format fit for digest emails.
  """
  @spec compile(binary, %{binary => [Notification.t]}) :: {User.t, [{Repository.t, integer}]}
  def compile(user_id, notif_groups) do
    user  = Core.Services.Users.get_user(user_id)
    repos = Enum.map(notif_groups, fn {_repo_id, [%{repository: repo} | _] = notifs} ->
      {repo, length(notifs)}
    end)
    {user, repos}
  end
end
