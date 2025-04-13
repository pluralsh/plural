defmodule Core.MCP.Tools.EnterpriseTest do
  use Core.SchemaCase, async: true
  alias Core.MCP.Tools.Enterprise

  describe "#invoke/1" do
    test "it will handle putting an account on the enterprise plan" do
      plan = insert(:platform_plan, name: "Enterprise", enterprise: true)
      trial = insert(:platform_plan, name: "Pro Trial", trial: true)
      account = insert(:account)
      insert(:platform_subscription, account: account, plan: trial)

      {:ok, res} = Enterprise.invoke(%{"account_id" => account.id})
      assert is_binary(res)

      %{subscription: %{plan: p}} = Core.Repo.preload(account, [subscription: :plan], force: true)

      assert p.enterprise
      assert p.id == plan.id
    end
  end
end
