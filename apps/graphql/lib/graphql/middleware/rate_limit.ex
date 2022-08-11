defmodule GraphQl.Middleware.RateLimit do
  @behaviour Absinthe.Middleware
  alias Absinthe.Resolution
  alias Core.Services.Audits
  alias Core.Schema.{AuditContext, User}

  def call(conn, %{time: t, limit: l}) do
    case Hammer.check_rate("#{key(conn)}:#{localized(conn, Audits.context())}", t, l) do
      {:allow, _} -> conn
      {:deny, _} -> Resolution.put_result(conn, {:error, "Rate limited.  This operation can only be called #{l} times per #{t / 1000} seconds"})
    end
  end
  def call(conn, opts) when is_list(opts), do: call(conn, Map.new(opts))

  defp key(%Resolution{} = res) do
    Resolution.path_string(res)
    |> Enum.join(".")
  end

  defp localized(%{context: %{current_user: %User{id: id}}}, _), do: id
  defp localized(_, %AuditContext{ip: ip}), do: ip
  defp localized(_, _), do: ""
end
