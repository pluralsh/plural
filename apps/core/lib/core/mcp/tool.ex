defmodule Core.MCP.Tool do
  @doc """
  The mcp server tool description
  """
  @callback description() :: binary

  @doc """
  jsonapi format input schema
  """
  @callback schema() :: map

  @doc """
  name of the tool
  """
  @callback name() :: binary

  @doc """
  actually calls the tool
  """
  @callback invoke(args :: map) :: {:ok, binary} | {:error, binary}
end
