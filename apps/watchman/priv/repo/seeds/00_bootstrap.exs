import Botanist
import System, only: [get_env: 1]

alias Watchman.{Repo, Schema}

seed do
  %Schema.User{
    name: get_env("ADMIN_NAME"),
    email: get_env("ADMIN_EMAIL"),
  }
  |> Schema.User.changeset(%{password: get_env("ADMIN_PASSWORD")})
  |> Repo.insert!()
end