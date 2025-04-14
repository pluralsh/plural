defmodule Core.MCP.Tools.CloudConsole do
  @behaviour Core.MCP.Tool
  alias Core.Repo
  alias Core.Services.Cloud
  alias Core.Mcp.Serialization.Proto
  alias Core.Schema.{ConsoleInstance}

  def name(), do: "console_cluster"

  def description(), do: "Fetches the details of a cloud console"

  def schema() do
    %{
      type: "object",
      required: ["name"],
      properties: %{
        name: %{
          type: "string",
          description: "The name of the console instance"
        }
      }
    }
  end

  def invoke(%{"name" => name}) do
    with %ConsoleInstance{} = console <- Cloud.get_instance_by_name(name) do
      Repo.preload(console, [:cluster, owner: [account: [subscription: :plan]]])
      |> Proto.serialize()
      |> Jason.encode()
    else
      _ -> {:ok, "no instance with name #{name}"}
    end
  end
  def invoke(_), do: {:error, "email is required"}
end
