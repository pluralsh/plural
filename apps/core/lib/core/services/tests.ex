defmodule Core.Services.Tests do
  use Core.Services.Base
  import Core.Policies.Test
  alias Core.PubSub
  alias Core.Schema.{
    User,
    Test,
  }
  alias Core.Services.{Versions, Repositories}

  @type error :: {:error, term}
  @type test_resp :: {:ok, Test.t} | error

  def get_test!(id), do: Core.Repo.get!(Test, id)

  @doc """
  Will create a new test object for the given repo, with bindings
  for all the user's current installations
  """
  @spec create_test(map, binary, User.t) :: test_resp
  def create_test(attrs, repository_id, %User{id: user_id} = user) do
    inst     = Repositories.get_installation(user_id, repository_id)
    versions = Versions.installed_versions(repository_id, user)
    attrs    = Map.merge(attrs, %{
      bindings: Enum.map(versions, & %{version_id: &1.id}),
      source_tag: inst.track_tag,
    })

    %Test{creator_id: user_id, repository_id: repository_id}
    |> Test.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
    |> notify(:create)
  end

  @doc """
  Will update a test for given attrs
  """
  @spec update_test(map, binary, User.t) :: test_resp
  def update_test(attrs, test_id, %User{} = user) do
    get_test!(test_id)
    |> Core.Repo.preload([:bindings, :steps])
    |> Test.changeset(attrs)
    |> allow(user, :edit)
    |> when_ok(:update)
    |> notify(:update)
  end

  defp notify({:ok, %Test{} = test}, :create),
    do: handle_notify(PubSub.TestCreated, test)
  defp notify({:ok, %Test{} = test}, :update),
    do: handle_notify(PubSub.TestUpdated, test)

  defp notify(pass, _), do: pass
end
