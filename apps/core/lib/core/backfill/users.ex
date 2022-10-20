defmodule Core.Backfill.Users do
  alias Core.{Schema.User}

  def onboarding() do
    User
    |> User.ordered(asc: :id)
    |> Core.Repo.stream(method: :keyset)
    |> Core.throttle()
    |> Enum.each(fn user ->
      # don't show onboarding to existing users
      {:ok, _} = User.changeset(user, %{onboarding_checklist: %{dismissed: true, status: :finished}})
                 |> Core.Repo.update()
    end)
  end
end
