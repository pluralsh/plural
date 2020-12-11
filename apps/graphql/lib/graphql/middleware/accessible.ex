defmodule GraphQl.Middleware.Accessible do
  @behaviour Absinthe.Middleware
  import Absinthe.Resolution, only: [put_result: 2]
  alias Core.Services.Repositories
  alias Core.Schema.User

  def call(%{arguments: %{repository_id: repo_id}, context: %{current_user: %User{} = user}} = res, _) do
    repo = Repositories.get_repository!(repo_id)

    case Core.Policies.Repository.allow(repo, user, :access) do
      {:ok, _} -> res
      _ -> put_result(res, {:error, "forbidden"})
    end
  end
end