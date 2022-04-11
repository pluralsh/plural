defmodule GraphQl.Resolvers.Test do
  use GraphQl.Resolvers.Base, model: Core.Schema.Test
  alias Core.Schema.TestStep
  alias Core.Services.{Tests}

  def query(TestStep, _), do: TestStep
  def query(_, _), do: Test

  def list_tests(%{version_id: vsn_id} = args, _) do
    Test.for_version(vsn_id)
    |> Test.ordered()
    |> paginate(args)
  end

  def list_tests(%{repository_id: repo_id} = args, _) do
    Test.for_repository(repo_id)
    |> Test.ordered()
    |> paginate(args)
  end

  def resolve_test(%{id: id}, _), do: {:ok, Tests.get_test!(id)}

  def resolve_logs(%{id: id, step: step}, _) do
    %{steps: steps} = Tests.get_test!(id) |> Core.Repo.preload([:steps])
    with %TestStep{} = step <- Enum.find(steps, & &1.id == step),
         url <- Core.Storage.url({step.logs, step}, :original),
         {:ok, %HTTPoison.Response{body: body}} <- HTTPoison.get(url),
      do: {:ok, body}
  end

  def create_test(%{attributes: attrs} = args, %{context: %{current_user: user}}) do
    repo_id = get_repo_id(args)
    Tests.create_test(attrs, repo_id, user)
  end

  def update_test(%{attributes: attrs, id: id}, %{context: %{current_user: user}}),
    do: Tests.update_test(attrs, id, user)

  def update_step(%{attributes: attrs, id: id}, %{context: %{current_user: user}}),
    do: Tests.update_step(attrs, id, user)
end
