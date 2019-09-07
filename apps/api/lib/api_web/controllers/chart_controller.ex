defmodule ApiWeb.ChartController do
  use ApiWeb, :controller
  alias Core.Services.Charts

  def create(conn, params) do
    current_user = Guardian.Plug.current_resource(conn)

    with {:ok, chart} <- Charts.create_chart(params, current_user),
      do: json(conn, chart)
  end

  def version(conn, %{"chart_id" => chart_id} = params) do
    current_user = Guardian.Plug.current_resource(conn)

    with {:ok, chart} <- Charts.create_version(params, chart_id, current_user),
      do: json(conn, chart)
  end

  def token(conn, %{"chart_id" => chart_id}) do
    current_user = Guardian.Plug.current_resource(conn)
    chart = Charts.get_chart(chart_id)

    with {:ok, token} <- Charts.gen_token(chart, current_user),
      do: json(conn, %{access_token: token})
  end
end