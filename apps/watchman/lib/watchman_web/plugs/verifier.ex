defmodule WatchmanWeb.Verifier do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    secret = Watchman.conf(:webhook_secret)
    with %{raw_body: payload} <- conn.assigns,
         [signature] <- get_req_header(conn, "x-watchman-signature"),
         computed <- "sha1=#{Watchman.hmac(secret, payload)}",
         true <- Plug.Crypto.secure_compare(computed, signature) do
      conn
    else
      _ -> send_resp(conn, 403, "Forbidden") |> halt()
    end
  end
end