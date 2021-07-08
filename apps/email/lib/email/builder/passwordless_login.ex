defmodule Email.Builder.PasswordlessLogin do
  use Email.Builder.Base

  def email(login) do
    %{user: user} = login = Core.Repo.preload(login, [:user])

    base_email()
    |> to(user)
    |> subject("Login to plural")
    |> assign(:user, user)
    |> assign(:login, login)
    |> render(:passwordless_login)
  end
end
