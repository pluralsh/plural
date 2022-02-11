defmodule GraphQl.Middleware.Authenticated do
  @behaviour Absinthe.Middleware
  alias Core.Schema.User

  def call(%{context: %{current_user: %User{external: true}}} = res, :external), do: res
  def call(%{context: %{current_user: %User{external: true}}} = res, _),
    do: Absinthe.Resolution.put_result(res, {:error, "unauthorized"})

  def call(%{context: %{current_user: %User{}}} = res, _config), do: res
  def call(resolution, _),
    do: Absinthe.Resolution.put_result(resolution, {:error, "unauthenticated"})
end
