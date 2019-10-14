defmodule GraphQl.Resolvers.Chart do
  use GraphQl.Resolvers.Base, model: Core.Schema.Chart
  alias Core.Services.{Charts, Repositories}
  alias Core.Schema.{Version}

  def query(Version, _), do: Version
  def query(_, _), do: Chart

  def list_charts(%{repository_id: repo_id} = args, %{context: %{current_user: user}}) do
    with {:ok, _} <- Repositories.authorize(repo_id, user) do
      Chart.for_repository(repo_id)
      |> Chart.ordered()
      |> paginate(args)
    end
  end

  def list_versions(%{chart_id: chart_id} = args, %{context: %{current_user: user}}) do
    with {:ok, _} <- Charts.authorize(chart_id, user) do
      Version.for_chart(chart_id)
      |> Version.ordered()
      |> paginate(args)
    end
  end
end