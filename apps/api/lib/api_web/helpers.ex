defmodule ApiWeb.Helpers do
  import Plug.Conn

  def add_auth_headers(conn, user) do
    {:ok, token, _} = Api.Guardian.encode_and_sign(user, %{})
    put_resp_header(conn, "authorization", "Bearer #{token}")
  end
end