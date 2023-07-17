defmodule Email.Helper do
  alias Core.Services.{Users, Repositories}
  alias Core.Schema.User

  def confirm_email(email) do
    case Users.get_user_by_email(email) do
      %User{} -> Users.create_reset_token(%{type: :email, email: email})
      _ -> Users.create_user(%{email: email, password: Ecto.UUID.generate(), name: email})
    end
  end

  def password_reset(email) do
    user = Users.get_user_by_email!(email)
    Users.create_reset_token(%{type: :password, email: user.email})
  end

  def digest_email(type, email, repos) do
    user = Users.get_user_by_email(email)
    repos = Enum.map(repos, &Repositories.get_repository_by_name/1)

    apply(Email.Builder.Digest, type, [user, Enum.map(repos, & {&1, 1})])
    |> Core.Email.Mailer.deliver_now()
  end

  def create_publisher(name, %User{} = user), do: Users.create_publisher(%{name: name}, user)

  def create_repo(name, %User{} = user),
    do: Repositories.create_repository(%{name: name, category: :data}, user)
end
