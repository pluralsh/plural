defmodule Email.Builder.Invite do
  use Email.Builder.Base

  def email(invite) do
    %{user: user, account: account} = invite = Core.Repo.preload(invite, [:user, account: :root_user])
    base_email()
    |> to(user)
    |> subject("You've been invited to join #{account.root_user.email}'s account")
    |> assign(:user, user)
    |> assign(:account, account)
    |> assign(:inv, invite)
    |> render(:invite)
  end
end
