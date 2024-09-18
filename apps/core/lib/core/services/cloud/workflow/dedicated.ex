defmodule Core.Services.Cloud.Workflow.Dedicated do
  use Core.Services.Base
  import Core.Services.Cloud.Utils

  alias Core.Clients.Console
  alias Core.Services.{Users}
  alias Core.Services.Cloud.{Poller, Configuration}
  alias Core.Schema.{ConsoleInstance, User}
  alias Core.Repo

  require Logger

  @behaviour Core.Services.Cloud.Workflow

  def sync(%ConsoleInstance{external_id: id} = inst) when is_binary(id) do
    with {:ok, project_id} <- Poller.project(),
         {:ok, repo_id} <- Poller.repository(),
         {:ok, actor} <- Console.me(dedicated_console()),
         attrs = %{actor_id: actor, project_id: project_id, repository_id: repo_id},
      do: Console.update_stack(dedicated_console(), id, Configuration.stack_attributes(inst, attrs))
  end

  def sync(_), do: :ok

  def up(%ConsoleInstance{status: :pending} = inst) do
    with {:ok, id} <- Poller.project(),
         {:ok, repo_id} <- Poller.repository(),
         {:ok, actor} <- Console.me(dedicated_console()),
         attrs = %{actor_id: actor, project_id: id, repository_id: repo_id},
         {:ok, stack_id} <- Console.create_stack(dedicated_console(), Configuration.stack_attributes(inst, attrs)) do
      ConsoleInstance.changeset(inst, %{
        instance_status: %{stack: true},
        status: :stack_created,
        external_id: stack_id
      })
      |> Repo.update()
    end
  end

  def up(%ConsoleInstance{status: :stack_created, external_id: id} = inst) do
    Enum.reduce_while(0..120, inst, fn _, inst ->
      dedicated_console()
      |> Console.stack(id)
      |> case do
        {:ok, %{"status" => "SUCCESSFUL"}} ->
          {:halt, mark_provisioned(inst)}
        status ->
          Logger.info "stack not ready yet, sleeping: #{inspect(status)}"
          :timer.sleep(:timer.minutes(1))
          {:cont, inst}
      end
    end)
  end

  def up(inst), do: {:ok, inst}

  def down(%ConsoleInstance{instance_status: %{stack: true}, external_id: id} = inst) do
    with {:ok, _} <- Console.delete_stack(dedicated_console(), id) do
      ConsoleInstance.changeset(inst, %{status: :stack_deleted})
      |> Repo.update()
    end
  end

  def down(inst), do: {:ok, inst}

  def finalize(%ConsoleInstance{} = inst, :down) do
    start_transaction()
    |> add_operation(:inst, fn _ -> Repo.delete(inst) end)
    |> add_operation(:sa, fn %{inst: %{name: name}} ->
      case Users.get_user_by_email("#{name}-cloud-sa@srv.plural.sh") do
        %User{} = u -> Repo.delete(u)
        _ -> {:ok, nil}
      end
    end)
    |> execute(extract: :inst)
  end

  def finalize(inst, _), do: {:ok, inst}
end
