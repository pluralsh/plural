defmodule ApiWeb.InstallationController do
  use ApiWeb, :controller
  alias Core.Services.Repositories

  def create(conn, %{"repository_id" => repository_id} = params) do
    current_user = Guardian.Plug.current_resource(conn)

    with {:ok, inst} <- Repositories.create_installation(params, repository_id, current_user),
      do: json(conn, inst)
  end
end