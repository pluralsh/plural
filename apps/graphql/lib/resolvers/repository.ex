defmodule GraphQl.Resolvers.Repository do
  use GraphQl.Resolvers.Base, model: Core.Schema.Repository
  alias Core.Services.Repositories

  def query(_, _), do: Repository

  def list_repositories(%{publisher_id: pid} = args, _) when not is_nil(pid) do
    Repository.for_publisher(pid)
    |> Repository.ordered()
    |> paginate(args)
  end

  def list_repositories(args, %{context: %{current_user: user}}) do
    Repository.for_user(user.id)
    |> Repository.ordered()
    |> paginate(args)
  end
end