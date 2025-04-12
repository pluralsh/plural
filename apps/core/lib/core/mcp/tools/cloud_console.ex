defmodule Core.MCP.Tools.CloudConsole do
  @behaviour Core.MCP.Tool
  alias Core.Repo
  alias Core.Services.Cloud
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
    with %ConsoleInstance{} = console <- Cloud.get_instance_by_name(name),
         console = Repo.preload(console, [:cluster, owner: [account: [subscription: :plan]]]) do
      Jason.encode(format(console))
    else
      _ -> {:ok, "no instance with name #{name}"}
    end
  end
  def invoke(_), do: {:error, "email is required"}

  defp format(console) do
    Map.take(console, ~w(id type name status subdomain url cloud size region cluster owner)a)
  end
end
