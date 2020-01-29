defmodule ApiWeb.EmailController do
  use ApiWeb, :controller

  plug ApiWeb.Plugs.LicenseAuthorizer

  def email(conn, params) do
    with {:ok, email} <- Core.Services.Email.mk(params) do
      Core.Services.Email.send(email)
      json(conn, %{delivered: true})
    end
  end
end