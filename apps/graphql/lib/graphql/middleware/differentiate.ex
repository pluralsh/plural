defmodule GraphQl.Middleware.Differentiate do
  @behaviour Absinthe.Middleware
  alias Absinthe.Resolution
  alias Core.{Schema.User, Services.Payments}

  def call(%{context: %{current_user: %User{} = user}} = res, %{feature: feature}) do
    case Payments.has_feature?(user, feature) do
      true -> res
      false -> Resolution.put_result(res, {:error, "your account does not have access to this functionality"})
    end
  end
  def call(conn, opts) when is_list(opts), do: call(conn, Map.new(opts))
end
