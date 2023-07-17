defmodule Email.Builder.Digest do
  use Email.Builder.Base

  def pending(user, repositories) do
    base_email()
    |> to(expand_service_account(user))
    |> subject("You have upgrades pending promotion")
    |> assign(:user, user)
    |> assign(:repos, repositories)
    |> render(:pending_upgrades)
  end

  def locked(user, repositories) do
    base_email()
    |> to(expand_service_account(user))
    |> subject("You have manual upgrades that have yet to be applied")
    |> assign(:user, user)
    |> assign(:repos, repositories)
    |> render(:locked_upgrades)
  end
end
