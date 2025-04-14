defmodule Core.MCP.Router do
  use Plug.Router
  alias Plug.Conn
  alias Core.MCP.Jwt

  plug Plug.Parsers,
   parsers: [:urlencoded, :json],
   pass: ["text/*"],
   json_decoder: Jason

  plug Plug.SSL, rewrite_on: [
    :x_forwarded_proto,
    :x_forwarded_host,
    :x_forwarded_port
  ]

  plug :match
  plug :ensure_session_id
  plug :authorize
  plug :dispatch

  forward "/sse", to: SSE.ConnectionPlug
  forward "/message", to: SSE.ConnectionPlug

  match _ do
   send_resp(conn, 404, "Not found")
  end

  # Middleware to ensure session ID exists
  def ensure_session_id(%Conn{query_params: %{"sessionId" => id}} = conn, _) when is_binary(id),
    do: conn
  def ensure_session_id(conn, _opts) do
    session_id = Base.encode16(:crypto.strong_rand_bytes(8), case: :lower)
    put_in(conn.query_params["sessionId"], session_id)
  end

  def authorize(conn, _) do
    with ["Bearer " <> token | _] <- get_req_header(conn, "authorization"),
         true <- authorized?(token) do
      conn
    else
      _ ->
        send_resp(conn, 403, "unauthorized")
        |> halt()
    end
  end

  @groups ~w(sales ops)

  defp authorized?(token) do
    case Jwt.exchange(token) do
      {:ok, %{"admin" => true}} -> true
      {:ok, %{"groups" => groups}} -> Enum.any?(groups, & &1 in @groups)
      _ -> false
    end
  end
end
