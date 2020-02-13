defmodule Watchman.Services.Builds do
  use Watchman.Services.Base
  alias Watchman.Schema.Build

  def create(attrs) do
    %Build{type: :deploy, status: :queued}
    |> Build.changeset(attrs)
    |> Repo.insert()
    |> when_ok(&wake_deployer/1)
  end

  def poll() do
    Build.queued()
    |> Build.first()
    |> Build.ordered(desc: :inserted_at)
    |> Repo.one()
  end

  def running(build),
    do: modify_status(build, :running)

  def succeed(build),
    do: modify_status(build, :successful)

  def fail(build),
    do: modify_status(build, :failed)

  defp modify_status(build, state) do
    build
    |> Build.changeset(add_completion(%{status: state}, state))
    |> Repo.update()
  end

  defp add_completion(attrs, state) when state in [:successful, :failed],
    do: Map.put(attrs, :completed_at, Timex.now())
  defp add_completion(attrs, _), do: attrs

  defp wake_deployer(build) do
    Watchman.Deployer.wake()
    {:ok, build}
  end
end