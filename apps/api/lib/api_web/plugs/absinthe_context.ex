defmodule ApiWeb.Plugs.AbsintheContext do
  import Plug.Conn
  alias Core.Schema.User

  @context ~w(user origin)a

  def init(opts), do: opts

  def call(conn, _opts) do
    Enum.map(@context, &context(conn, &1))
    |> Enum.filter(& &1)
    |> assign(conn)
  end

  defp context(conn, :user) do
    case Guardian.Plug.current_resource(conn) do
      %User{} = user -> {:current_user, user}
      _ -> nil
    end
  end

  defp context(conn, :origin) do
    case get_req_header(conn, "origin") do
      [origin | _] when is_binary(origin) -> {:origin, origin}
      _ -> nil
    end
  end

  defp assign(ctx, conn), do: Absinthe.Plug.assign_context(conn, ctx)
end
