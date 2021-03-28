defmodule ApiWeb.Plugs.LicenseAuthorizer do
  import Plug.Conn
  alias Core.Services.Repositories

  def init(opts), do: opts

  def call(conn, _opts) do
    with ["Bearer " <> token | _] <- get_req_header(conn, "authorization"),
         %{} = license_token <- Repositories.get_license_token(token) do
      assign(conn, :license_token, license_token)
    else
      _ ->
        ApiWeb.FallbackController.call(conn, {:error, :forbidden})
        |> halt()
    end
  end
end
