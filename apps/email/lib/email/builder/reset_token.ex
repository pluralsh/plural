defmodule Email.Builder.ResetToken do
  use Email.Builder.Base

  def email(token) do
    %{user: user} = token = Core.Repo.preload(token, [:user])

    base_email()
    |> to(user)
    |> subject(email_subject(token))
    |> assign(:user, user)
    |> assign(:token, token)
    |> render(render_view(token))
  end

  defp render_view(%{type: :password}), do: :reset_password
  defp render_view(%{type: :email}), do: :confirm_email

  defp email_subject(%{type: :email}), do: "Confirm your email"
  defp email_subject(%{type: :password}), do: "Reset your password"
end
