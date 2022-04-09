defmodule Core.Services.Tests do
  use Core.Services.Base
  import Core.Policies.Test
  alias Core.PubSub
  alias Core.Schema.{
    User,
    Test,
    Version
  }
  alias Core.Services.{Versions, Repositories}

  @type error :: {:error, term}
  @type test_resp :: {:ok, Test.t} | error

  def get_test!(id), do: Core.Repo.get!(Test, id)

  def get_test(id), do: Core.Repo.get(Test, id)

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

  def promote(%Test{status: :succeeded, promote_tag: tag} = test) do
    %Test{bindings: bindings, creator: user} = Core.Repo.preload(test, [:creator, bindings: :version])

    bindings
    |> Enum.reduce(start_transaction(), fn %{version: version}, tx ->
      add_operation(tx, version.id, fn _ ->
        case compare_vsn(version, tag) do
          :gt -> Versions.create_tag(version, tag)
          _ -> {:ok, :ignore}
        end
      end)
    end)
    |> execute()
    |> case do
      {:ok, results} -> send_notifs(results, user)
      err -> err
    end
  end

  defp compare_vsn(%Version{version: vsn} = v, tag) do
    Versions.get_tag(v, tag)
    |> Core.Repo.preload([:version])
    |> case do
      %{version: %{version: vsn2}} -> Elixir.Version.compare(vsn, vsn2)
      _ -> :gt
    end
  end

  defp send_notifs(results, user) do
    Enum.map(results, fn
      {k, :ignore} -> {k, :ignore}
      {k, vt} ->
        %{version: vsn} = Core.Repo.preload(vt, [:version])
        {:ok, _} = Versions.notify({:ok, vsn}, :update, user)
        {k, vsn}
    end)
    |> Enum.into(%{})
    |> ok()
  end

  defp notify({:ok, %Test{} = test}, :create),
    do: handle_notify(PubSub.TestCreated, test)
  defp notify({:ok, %Test{} = test}, :update),
    do: handle_notify(PubSub.TestUpdated, test)

  defp notify(pass, _), do: pass
end
