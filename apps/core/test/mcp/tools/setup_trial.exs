defmodule Core.MCP.Tools.SetupTrialTest do
  use Core.SchemaCase, async: true
  alias Core.MCP.Tools.SetupTrial

  describe "invoke/1" do
    setup [:setup_trial]
    test "it will fetch a users account info", %{plan: plan} do
      account = insert(:account)

      {:ok, res} = SetupTrial.invoke(%{"account_id" => account.id})

      assert is_binary(res)

      %{subscription: sub} = Repo.preload(account, [:subscription], force: true)
      assert sub.plan_id == plan.id
    end
  end
end
