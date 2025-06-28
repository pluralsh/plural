defmodule Core.Services.Cloud.Workflow do
  use Core.Services.Base
  alias Core.Repo
  alias Core.Schema.{ConsoleInstance}
  alias Core.Services.Cloud.Workflow.{Dedicated, Shared}

  require Logger

  @type error :: {:error, term}
  @type resp :: {:ok, ConsoleInstance.t} | error

  @callback sync(inst :: ConsoleInstance.t) :: :ok | {:ok, term} | error
  @callback up(inst :: ConsoleInstance.t) :: resp
  @callback down(inst :: ConsoleInstance.t) :: resp
  @callback finalize(inst :: ConsoleInstance.t, :up | :down) :: resp

  def provision(%ConsoleInstance{} = instance) do
    instance = Repo.preload(instance, [:postgres, :cluster])

    Enum.reduce_while(0..20, instance, fn _, acc ->
      case up(acc) do
        {:ok, %ConsoleInstance{status: :provisioned} = inst} -> {:halt, inst}
        {:ok, inst} -> {:cont, inst}
        err ->
          :timer.sleep(:timer.seconds(1))
          Logger.error "failed to transition provisioning console: #{inspect(err)}"
          {:cont, acc}
      end
    end)
    |> finalize(:up)
  end

  def deprovision(%ConsoleInstance{} = instance) do
    instance = Repo.preload(instance, [:postgres, :cluster])

    Enum.reduce_while(0..20, instance, fn _, acc ->
      case down(acc) do
        {:ok, %ConsoleInstance{status: :pending} = inst} -> {:halt, inst}
        {:ok, %ConsoleInstance{status: status} = inst} when status in ~w(database_deleted deployment_deleted)a ->
          {:halt, inst}
        {:ok, %ConsoleInstance{status: :stack_deleted} = inst} -> {:halt, inst}
        {:ok, inst} -> {:cont, inst}
        err ->
          :timer.sleep(:timer.seconds(10))
          Logger.error "failed to transition deprovisioning console: #{inspect(err)}"
          {:cont, acc}
      end
    end)
    |> finalize(:down)
  end

  def sync(%ConsoleInstance{type: :dedicated} = inst), do: Dedicated.sync(inst)
  def sync(inst), do: Shared.sync(inst)

  defp up(%ConsoleInstance{type: :dedicated} = inst), do: Dedicated.up(inst)
  defp up(inst), do: Shared.up(inst)

  defp down(%ConsoleInstance{type: :dedicated} = inst), do: Dedicated.down(inst)
  defp down(inst), do: Shared.down(inst)

  defp finalize(%ConsoleInstance{type: :dedicated} = inst, direction), do: Dedicated.finalize(inst, direction)
  defp finalize(%ConsoleInstance{} = inst, direction), do: Shared.finalize(inst, direction)
end
