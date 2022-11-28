defmodule GraphQl.Middleware.Accessible do
  @behaviour Absinthe.Middleware
  import Absinthe.Resolution, only: [put_result: 2]
  alias Core.Services.Repositories
  alias Core.Schema.{Repository}

  def call(%{arguments: args, context: context} = res, _) do
    with {:ok, %Repository{private: true} = repo} <- get_repo(args),
         {:ok, _} <- Core.Policies.Repository.allow(repo, context[:current_user], :access) do
      add_repo(res, repo)
    else
      {:ok, %Repository{} = repo} -> add_repo(res, repo)
      {:error, msg} -> put_result(res, {:error, msg})
    end
  end

  defp add_repo(%{context: ctx} = res, repo), do: %{res | context: Map.put(ctx, :repo, repo)}

  defp get_repo(%{repository_id: repo_id}) when is_binary(repo_id), do: {:ok, Repositories.get_repository!(repo_id)}
  defp get_repo(%{repository_name: name}) when is_binary(name), do: {:ok, Repositories.get_repository_by_name!(name)}
  defp get_repo(_), do: {:error, "one of repositoryId or repositoryName are required"}
end
