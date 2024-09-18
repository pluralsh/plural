defmodule Core.Services.Cloud.Utils do
  alias Core.Repo
  alias Core.Clients.Console
  alias Core.Schema.{ConsoleInstance}

  def mark_provisioned(inst) do
    ConsoleInstance.changeset(inst, %{status: :provisioned})
    |> Repo.update()
  end

  def console(), do: Console.new(Core.conf(:console_url), Core.conf(:console_token))

  def dedicated_console(), do: Console.new(Core.conf(:console_url), Core.conf(:dedicated_console_token))
end
