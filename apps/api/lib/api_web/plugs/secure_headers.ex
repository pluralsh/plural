defmodule ApiWeb.Plugs.SecureHeaders do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    conn
    |> put_resp_header("x-frame-options", "ALLOW-FROM #{Core.url("/")}")
    |> put_resp_header("content-security-policy", "frame-ancestors #{Core.url("/")};")
  end
end
