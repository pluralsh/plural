import Botanist
import System, only: [get_env: 1]

alias Core.Repo
alias Core.Schema

seed do
  admin = %Schema.User{
    name: get_env("ADMIN_NAME"),
    email: get_env("ADMIN_EMAIL"),
  } |> Schema.User.changeset(%{
    password: get_env("ADMIN_PASSWORD")
  }) |> Repo.insert!()
  {:ok, _} = Core.Services.Users.create_publisher(%{name: get_env("PUBLISHER_NAME")}, admin)
end