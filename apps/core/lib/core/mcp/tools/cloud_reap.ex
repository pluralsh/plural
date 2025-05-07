defmodule Core.MCP.Tools.CloudReap do
  @behaviour Core.MCP.Tool
  alias Core.Repo
  alias Core.Services.Cloud
  alias Core.Mcp.Serialization.Proto
  alias Core.Services.Cloud
  alias Core.Schema.{ConsoleInstance}

  def name(), do: "reap_cloud_cluster"

  def description(), do: "Initiates the reaping process for a cloud cluster, which involves sending two warning emails until ultimately deleting it"

  def schema() do
    %{
      type: "object",
      required: ["name"],
      properties: %{
        name: %{
          type: "string",
          description: "The name of the console instance to reap"
        }
      }
    }
  end

  def invoke(%{"name" => name}) do
    with %ConsoleInstance{} = console <- Cloud.get_instance_by_name(name),
         {:ok, _inst} <- Cloud.reap(console) do
      res = Repo.preload(console, [:cluster, owner: [account: [subscription: :plan]]])
            |> Proto.serialize()
            |> Jason.encode!()
      {:ok, """
        Initiated reaping of cloud console.  Attributes are:

        ```json
        #{res}
        ```
      """}
    else
      _ -> {:ok, "no instance with name #{name}"}
    end
  end
  def invoke(_), do: {:error, "email is required"}
end
