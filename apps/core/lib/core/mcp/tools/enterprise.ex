defmodule Core.MCP.Tools.Enterprise do
  @behaviour Core.MCP.Tool
  alias Core.Services.{Accounts, Payments}
  alias Core.Schema.Account

  def name(), do: "add_enterprise_plan"

  def description(), do: "Adds an account to the main enterprise plan"

  def schema() do
    %{
      type: "object",
      required: ["account_id"],
      properties: %{
        account_id: %{
          type: "string",
          description: "The account id to add to the enterprise plan.  You can fetch the id by first fetching the users account info."
        }
      }
    }
  end

  def invoke(%{"account_id" => id}) do
    with %Account{} = account <- Accounts.get_account(id),
         {:ok, _} <- Payments.remove_trial(account),
         {:ok, _} <- Payments.setup_enterprise_plan(account.id) do
      {:ok, "added the account to the enterprise plan successfully"}
    else
      _ -> {:ok, "no account with id #{id}"}
    end
  end
  def invoke(_), do: {:error, "account id is required"}
end
