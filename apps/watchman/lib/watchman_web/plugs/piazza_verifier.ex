defmodule WatchmanWeb.PiazzaVerifier do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    secret = Watchman.conf(:piazza_secret)
    with %{raw_body: payload} <- conn.assigns,
         [signature] <- get_req_header(conn, "x-piazza-signature"),
         [timestamp] <- get_req_header(conn, "x-piazza-timestamp"),
         computed <- Watchman.sha("#{payload}:#{timestamp}:#{secret}"),
         true <- Plug.Crypto.secure_compare(computed, signature) do
      conn
    else
      _ -> send_resp(conn, 403, "Forbidden") |> halt()
    end
  end
end