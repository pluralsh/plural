defmodule GraphQl.Resolvers.Metrics do
  use GraphQl.Resolvers.Base, model: Core.Schema.DockerRepository
  alias Core.Services.Metrics

  def resolve_docker(%{tag: tag} = args, %{source: docker_repo}) when is_binary(tag) do
    repo_name(docker_repo)
    |> Metrics.query_docker_pulls_for_tag(tag, time_opts(args))
  end

  def resolve_docker(args, %{source: docker_repo}) do
    repo_name(docker_repo)
    |> Metrics.query_docker_pulls(time_opts(args))
  end

  defp repo_name(%DockerRepository{name: dkr_name} = repo) do
    %{repository: %{name: repo_name}} = Core.Repo.preload(repo, [:repository])
    "#{repo_name}/#{dkr_name}"
  end

  defp time_opts(args) do
    Map.take(args, [:offset, :precision])
    |> Map.to_list()
    |> Enum.filter(&elem(&1, 1))
  end
end
