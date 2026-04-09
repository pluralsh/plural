defmodule GraphQl.Middleware.Deprecate do
  @behaviour Absinthe.Middleware

  def call(res, _),
    do: Absinthe.Resolution.put_result(res, {:error, "this feature is deprecated"})
end
