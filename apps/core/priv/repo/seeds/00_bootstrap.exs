import Botanist
import System, only: [get_env: 1]

alias Core.Repo
alias Core.Schema

seed do
  {:ok, admin} = Core.Services.Users.create_user(%{
    name: get_env("ADMIN_NAME"),
    email: get_env("ADMIN_EMAIL"),
    password: get_env("ADMIN_PASSWORD")
  })

  {:ok, _} = Core.Services.Users.create_publisher(%{
    name: get_env("PUBLISHER_NAME"),
    description: get_env("PUBLISHER_DESCRIPTION")
  }, admin)
end
