defmodule GraphQl.Middleware.AllowJwt do
  @behaviour Absinthe.Middleware

  def call(%{context: ctx} = res, _config), do: %{res | context: Map.put(ctx, :allow_jwt, true)}
end
