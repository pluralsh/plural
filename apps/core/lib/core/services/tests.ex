defmodule Core.Services.Tests do
  use Core.Services.Base
  import Core.Policies.Test
  alias Core.PubSub
  alias Core.Schema.{
    User,
    Test,
    TestStep,
    Version,
    VersionTag
  }
  alias Core.Services.{Versions, Repositories}

  @type error :: {:error, term}
  @type test_resp :: {:ok, Test.t} | error
  @type step_resp :: {:ok, TestStep.t} | error

  def get_test!(id), do: Core.Repo.get!(Test, id)

  def get_test(id), do: Core.Repo.get(Test, id)

  def get_step!(id), do: Core.Repo.get!(TestStep, id)

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
  @spec update_test(map, binary | Test.t, User.t) :: test_resp
  def update_test(attrs, test_id, %User{} = user) when is_binary(test_id) and is_map(attrs) do
    test = get_test!(test_id) |> Core.Repo.preload([:bindings, :steps])
    update_test(attrs, test, user)
  end

  def update_test(attrs, %Test{} = test, %User{} = user) do
    test
    |> Test.changeset(attrs)
    |> allow(user, :edit)
    |> when_ok(:update)
    |> notify(:update)
  end

  @doc """
  Will edit the attributes of a test step (useful for setting log objects)
  """
  @spec update_step(map, binary, User.t) :: step_resp
  def update_step(attrs, step_id, %User{} = user) do
    get_step!(step_id)
    |> Core.Repo.preload([:test])
    |> TestStep.changeset(attrs)
    |> allow(user, :edit)
    |> when_ok(:update)
    |> notify(:update)
  end

  @doc """
  Tags all bound versions to this test with its promote tag and sends appropriate update events to trigger downstream
  upgrades
  """
  @spec promote(Test.t) :: {:ok, map} | error
  def promote(%Test{status: :succeeded, promote_tag: tag} = test) do
    %Test{bindings: bindings, creator: user} = Core.Repo.preload(test, [:creator, bindings: :version])

    bindings
    |> Enum.reduce(start_transaction(), fn %{version: version}, tx ->
      Enum.reduce([tag | (test.tags || [])], tx, fn tag, tx ->
        add_operation(tx, {tag, version.id}, fn _ ->
          case compare_vsn(version, tag) do
            :gt -> Versions.create_tag(version, tag)
            _ -> {:ok, :ignore}
          end
        end)
      end)
    end)
    |> execute()
    |> case do
      {:ok, results} -> send_notifs(results, user)
      err -> err
    end
  end

  @doc """
  Expires an old unfinished test
  """
  @spec expire(Test.t) :: test_resp
  def expire(%Test{} = test) do
    test = Core.Repo.preload(test, [:steps])

    start_transaction()
    |> add_operation(:test, fn _ ->
      Test.changeset(test, %{status: :failed})
      |> Core.Repo.update()
    end)
    |> expire_steps(test.steps)
    |> execute(extract: :test)
  end

  defp expire_steps(xact, [_ | _] = steps) do
    Enum.reduce(steps, xact, fn
      %{status: s} = step, xact when s not in [:succeeded, :failed] ->
        add_operation(xact, {:step, step.id}, fn _ ->
          TestStep.changeset(step, %{status: :failed})
          |> Core.Repo.update()
        end)
      _, xact -> xact
    end)
  end
  defp expire_steps(xact, _), do: xact

  @doc """
  Sends a StepLogs event for the given logs, provided the user has edit permissions for the test
  """
  @spec publish_logs(binary, binary, User.t) :: step_resp
  def publish_logs(logs, step_id, %User{} = user) do
    step = get_step!(step_id)
    with {:ok, step} <- allow(step, user, :edit) do
      handle_notify(PubSub.StepLogs, {step, String.split(logs, ~r/\R/)})
      {:ok, step}
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
    Enum.filter(results, fn {_, v} -> v != :ignore end)
    |> Enum.uniq_by(fn {_, %VersionTag{version_id: v}} -> v end)
    |> Enum.map(fn {{_, k}, vt} ->
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
  defp notify({:ok, %TestStep{test: %Test{} = t} = step}, :update) do
    handle_notify(PubSub.TestUpdated, t)
    {:ok, step}
  end

  defp notify(pass, _), do: pass
end
