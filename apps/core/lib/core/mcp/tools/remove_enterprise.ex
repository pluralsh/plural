defmodule Core.MCP.Tools.RemoveEnterprise do
  @behaviour Core.MCP.Tool
  import Core.MCP.Tools.Utils
  alias Core.Services.{Payments}
  alias Core.Schema.Account

  def name(), do: "remove_enterprise_plan"

  def description(), do: "removes an account to the main enterprise plan"

  def schema() do
    %{
      type: "object",
      required: ["account_id"],
      properties: %{
        account_id: %{
          type: "string",
          description: "The account id (must be a UUID) to add to the enterprise plan. You can fetch the id by first querying a users account"
        }
      }
    }
  end

  def invoke(%{"account_id" => id}) do
    with {:account, {:ok, %Account{} = account}} <- {:account, get_account(id)},
         {:ok, _} <- Payments.remove_enterprise_plan(account.id) do
      {:ok, "removed the account from the enterprise plan successfully"}
    else
      {:account, {:error, err}} -> {:ok, err}
      {:account, _} -> {:ok, "no account with id #{id}"}
      err -> err
    end
  end

  def invoke(_), do: {:error, "account id is required"}
end
