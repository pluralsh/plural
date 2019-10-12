defmodule ApiWeb.ChartController do
  use ApiWeb, :controller
  alias Core.Services.Charts

  def create(conn, %{"repository_id" => repo_id} = params) do
    current_user = Guardian.Plug.current_resource(conn)

    with {:ok, chart} <- Charts.create_chart(params, repo_id, current_user),
      do: json(conn, chart)
  end

  def version(conn, %{"chart_id" => chart_id} = params) do
    current_user = Guardian.Plug.current_resource(conn)

    with {:ok, chart} <- Charts.create_version(params, chart_id, current_user),
      do: json(conn, chart)
  end
end