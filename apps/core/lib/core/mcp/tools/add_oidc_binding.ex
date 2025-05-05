defmodule Core.MCP.Tools.AddOIDCBinding do
  @behaviour Core.MCP.Tool
  alias Core.Services.Cloud

  def name(), do: "add_oidc_binding"

  def description(), do: "Adds an email to the oidc provider of a console instance"

  def schema() do
    %{
      type: "object",
      required: ["account_id"],
      properties: %{
        instance_name: %{
          type: "string",
          description: "The name of the console instance to add the binding to."
        },
        email: %{
          type: "string",
          description: "The email of the user to add to the console instance's oidc provider."
        }
      }
    }
  end

  def invoke(%{"instance_name" => name, "email" => email}) do
    with {:ok, _provider} <- Cloud.add_oidc_binding(name, email) do
      {:ok, "added email #{email} to the oidc provider successfully"}
    end
  end
  def invoke(_), do: {:error, "instance_name and email are required"}
end
