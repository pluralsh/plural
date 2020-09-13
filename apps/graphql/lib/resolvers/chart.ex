defmodule GraphQl.Resolvers.Chart do
  use GraphQl.Resolvers.Base, model: Core.Schema.Chart
  alias Core.Services.{Charts, Repositories}
  alias Core.Schema.{Version, ChartInstallation, VersionTag, Crd}

  def query(Version, _), do: Version
  def query(VersionTag, _), do: VersionTag
  def query(Crd, _), do: Crd
  def query(_, _), do: Chart

  def resolve_chart_installation(chart, user),
    do: {:ok, Charts.get_chart_installation(chart.id, user.id)}

  def resolve_chart(%{id: chart_id}, _),
    do: {:ok, Charts.get_chart!(chart_id)}

  def list_charts(%{repository_id: repo_id} = args, _) do
    Chart.for_repository(repo_id)
    |> Chart.ordered()
    |> paginate(args)
  end

  def list_chart_installations(%{repository_id: repo_id} = args, %{context: %{current_user: user}}) do
    ChartInstallation.for_repo(repo_id)
    |> ChartInstallation.for_user(user.id)
    |> paginate(args)
  end

  def list_versions(%{chart_id: chart_id} = args, _) do
    Version.for_chart(chart_id)
    |> Version.ordered()
    |> paginate(args)
  end

  def update_chart(%{attributes: attrs, id: id}, %{context: %{current_user: user}}),
    do: Charts.update_chart(attrs, id, user)

  def update_version(%{attributes: attrs, id: id}, %{context: %{current_user: user}}),
    do: Charts.update_version(attrs, id, user)

  def install_chart(%{installation_id: id, attributes: attrs}, %{context: %{current_user: user}}),
    do: Charts.create_chart_installation(attrs, id, user)

  def update_chart_installation(%{chart_installation_id: id, attributes: attrs}, %{context: %{current_user: user}}),
    do: Charts.update_chart_installation(attrs, id, user)

  def create_crd(%{attributes: attrs, chart_name: %{chart: chart, repo: repo}}, %{context: %{current_user: user}}) do
    case get_by_chart_name(repo, chart) do
      %{id: id} -> do_create_crd(attrs, id, user)
      _ -> {:error, "could not find chart for #{repo}/#{chart}"}
    end
  end

  def create_crd(%{attributes: attrs, chart_id: chart_id}, %{context: %{current_user: user}}),
    do: do_create_crd(attrs, chart_id, user)

  defp do_create_crd(attrs, chart_id, user) do
    case Charts.get_latest_version(chart_id) do
      %Version{id: id} -> Charts.create_crd(attrs, id, user)
      nil -> {:error, "could not find latest chart version"}
    end
  end

  def get_by_chart_name(repo, chart) do
    with %{id: id} <- Repositories.get_repository_by_name(repo),
      do: Charts.get_chart_by_name(id, chart)
  end
end