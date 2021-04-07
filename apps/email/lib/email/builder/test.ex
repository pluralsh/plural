defmodule Email.Builder.Test do
  use Email.Builder.Base

  def test_email(user) do
    base_email()
    |> to(user)
    |> subject("A test email")
    |> assign(:user, user)
    |> render(:test)
  end
end
