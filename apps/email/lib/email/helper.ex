defmodule Email.Helper do
  alias Core.Services.Users
  alias Core.Schema.User

  def send_confirm_email(email) do
    case Users.get_user_by_email(email) do
      %User{} -> Users.create_reset_token(%{type: :email, email: email})
      _ -> Users.create_user(%{email: email, password: Ecto.UUID.generate()})
    end
  end

  def password_reset(email) do
    user = Users.get_user_by_email!(email)
    Users.create_reset_token(%{type: :password, email: user.email})
  end
end
