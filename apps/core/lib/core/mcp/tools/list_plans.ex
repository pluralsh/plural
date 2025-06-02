defmodule Core.MCP.Tools.ListPlans do
  @behaviour Core.MCP.Tool
  alias Core.Repo
  alias Core.Schema.PlatformPlan
  alias Core.Mcp.Serialization.Proto

  def name(), do: "list_plans"

  def description(), do: "Lists all the visible plans in the system"

  def schema() do
    %{
      type: "object",
      required: [],
      properties: %{}
    }
  end

  def invoke(_) do
    PlatformPlan.visible()
    |> Repo.all()
    |> Proto.serialize()
    |> Jason.encode()
  end
end
