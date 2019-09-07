defmodule ApiWeb.InstallationController do
  use ApiWeb, :controller
  alias Core.Services.Charts

  def create(conn, %{"chart_id" => chart_id} = params) do
    current_user = Guardian.Plug.current_resource(conn)

    with {:ok, inst} <- Charts.create_installation(params, chart_id, current_user),
      do: json(conn, inst)
  end

  def token(conn, %{"installation_id" => id}) do
    current_user = Guardian.Plug.current_resource(conn)
    inst = Charts.get_installation!(id)

    with {:ok, token} <- Charts.gen_token(inst, current_user),
      do: json(conn, %{access_token: token})
  end
end