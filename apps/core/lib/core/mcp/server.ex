defmodule Core.MCP.Server do
  use MCPServer
  alias Core.MCP.Tools.{
    Account,
    AccountUsers,
    Enterprise,
    CloudConsole,
    CloudReap,
    RemoveEnterprise,
    AddOIDCBinding,
    SetupTrial,
    ListPlans,
    ModifyProPlan,
    AddDomainMapping,
    DeleteUser,
    WireSubscription
  }

  @tools [
    Account,
    AccountUsers,
    Enterprise,
    CloudConsole,
    CloudReap,
    RemoveEnterprise,
    AddOIDCBinding,
    SetupTrial,
    ListPlans,
    ModifyProPlan,
    AddDomainMapping,
    DeleteUser,
    WireSubscription
  ]
  @by_name Map.new(@tools, & {&1.name(), &1})

  @protocol_version "2024-11-05"

  @impl true
  def handle_ping(request_id) do
    {:ok, %{jsonrpc: "2.0", id: request_id, result: %{}}}
  end

  @impl true
  def handle_initialize(request_id, _params) do
    {:ok, %{
      jsonrpc: "2.0",
      id: request_id,
      result: %{
        protocolVersion: @protocol_version,
        capabilities: %{
          tools: %{
            listChanged: true
          }
        },
        serverInfo: %{
          name: "Plural MCP Server",
          version: "0.1.0"
        }
      }
    }}
  end

  @impl true
  def handle_list_tools(request_id, _params) do
    tools = Enum.map(@tools, & %{
      name: &1.name(),
      description: &1.description(),
      inputSchema: &1.schema()
    })
    {:ok, %{jsonrpc: "2.0", id: request_id, result: %{tools: tools}}}
  end

  @impl true
  def handle_call_tool(request_id, %{"name" => name} = params) do
    with {:tool, t} when not is_nil(t) <- {:tool, @by_name[name]},
         {:ok, result} <- t.invoke(params["arguments"]) do
       {:ok, %{jsonrpc: "2.0", id: request_id, result: %{content: [%{type: "text", text: result}]}}}
    else
      {:tool, _} ->
        {:error, %{
          jsonrpc: "2.0",
          id: request_id,
          error: %{
            code: -32601,
            message: "Method not found",
            data: %{
              name: "no tool with name #{name}"
            }
          }
        }}
      {:error, err} ->
        {:ok, %{jsonrpc: "2.0", id: request_id, result: %{isError: true, content: [%{type: "text", text: inspect(err)}]}}}
    end
  end
end
