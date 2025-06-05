defmodule Core.MCP.Tools.SetupTrial do
  @behaviour Core.MCP.Tool
  import Core.MCP.Tools.Utils
  alias Core.Services.{Payments}
  alias Core.Repo
  alias Core.Schema.{Account, PlatformSubscription, PlatformPlan}

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
         {:plan, %PlatformPlan{} = plan} <- {:plan, get_plan()},
         {:ok, _} <- maybe_setup_trial(Repo.preload(account, [:subscription]), plan) do
      {:ok, "trial established for #{id}"}
    else
      {:account, {:error, err}} -> {:ok, err}
      {:account, _} -> {:ok, "no account with id #{id}"}
      {:plan, _} -> {:ok, "no trial plan defined"}
      err -> err
    end
  end
  def invoke(_), do: {:error, "account id is required"}

  defp get_plan() do
    Core.conf(:trial_plan)
    |> Payments.get_platform_plan_by_name!()
  end

  defp maybe_setup_trial(%Account{subscription: %PlatformSubscription{}}, _plan),
    do: {:error, "account already has a subscription"}
  defp maybe_setup_trial(%Account{} = account, %PlatformPlan{id: id}) do
    %PlatformSubscription{account_id: account.id}
    |> PlatformSubscription.changeset(%{plan_id: id})
    |> Core.Repo.insert()
  end
end
