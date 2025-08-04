defmodule Core.MCP.Tools.AddDomainMapping do
  @behaviour Core.MCP.Tool
  alias Core.Services.Accounts

  def name(), do: "add_domain_mapping"

  def description(), do: "Adds a domain mapping to an account, for use with SSO setup"

  def schema() do
    %{
      type: "object",
      required: ["account_id", "domain"],
      properties: %{
        account_id: %{
          type: "string",
          description: "The account ID to add the domain mapping to."
        },
        domain: %{
          type: "string",
          description: "The domain to add to the account."
        }
      }
    }
  end

  def invoke(%{"account_id" => account_id, "domain" => domain}) do
    with {:ok, _provider} <- Accounts.add_domain_mapping(domain, account_id) do
      {:ok, "added domain #{domain} to the account successfully"}
    end
  end
  def invoke(_), do: {:error, "account_id and domain are required"}
end
