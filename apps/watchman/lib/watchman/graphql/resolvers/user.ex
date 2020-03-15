defmodule Watchman.GraphQl.Resolvers.User do
  alias Watchman.Services.Users

  def signin_user(%{email: email, password: password}, _) do
    Users.login_user(email, password)
    |> with_jwt()
  end

  defp with_jwt({:ok, user}) do
    with {:ok, token, _} <- Watchman.Guardian.encode_and_sign(user),
        do: {:ok, %{user | jwt: token}}
  end
  defp with_jwt(error), do: error
end