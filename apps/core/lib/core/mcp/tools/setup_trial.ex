defmodule Core.MCP.Tools.SetupTrial do
  @behaviour Core.MCP.Tool
  import Core.MCP.Tools.Utils
  alias Core.Services.{Payments}
  alias Core.Repo
  alias Core.Schema.{Account, PlatformSubscription}

  def name(), do: "setup_trial"

  def description(), do: "sets up a trial for an account"

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
         {:ok, _} <- maybe_setup_trial(Repo.preload(account, [:subscription])) do
      {:ok, "trial setup for #{id}"}
    else
      {:account, {:error, err}} -> {:ok, err}
      {:account, _} -> {:ok, "no account with id #{id}"}
      err -> err
    end
  end

  def invoke(_), do: {:error, "account id is required"}

  defp maybe_setup_trial(%Account{subscription: %PlatformSubscription{}}),
    do: {:error, "account already has a subscription"}
  defp maybe_setup_trial(%Account{} = account), do: Payments.begin_trial(%Account{account | trialed: false})
end
