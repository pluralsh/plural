defmodule WatchmanWeb.Plug.AuthErrorHandler do
  import Plug.Conn

  @behaviour Guardian.Plug.ErrorHandler
  @impl Guardian.Plug.ErrorHandler

  def auth_error(conn, {type, _reason}, _opts) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(401, Jason.encode!(%{message: to_string(type)}))
  end
end