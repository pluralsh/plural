defmodule ApiWeb.LicenseController do
  use ApiWeb, :controller
  alias Core.Services.Repositories

  def get(conn, %{"key" => key}) do
    inst = Repositories.get_installation_by_key!(key)
    with {:ok, license} <- Repositories.license(inst),
      do: json(conn, license)
  end
end
