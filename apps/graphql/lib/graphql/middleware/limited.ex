defmodule GraphQl.Middleware.Limited do
  @behaviour Absinthe.Middleware
  alias Absinthe.Resolution
  alias Core.{Schema.User, Services.Payments}

  def call(%{context: %{current_user: %User{} = user}} = res, %{limit: limit}) do
    case Payments.limited?(user, limit) do
      true -> Resolution.put_result(res, {:error, "your account has reached its #{limit} limit, please upgrade your plan"})
      false -> res
    end
  end
  def call(conn, opts) when is_list(opts), do: call(conn, Map.new(opts))
end
