defmodule Core.MCP.Tools.AccountTest do
  use Core.SchemaCase, async: true
  alias Core.MCP.Tools.Account

  describe "invoke/1" do
    test "it will fetch a users account info" do
      plan = insert(:platform_plan, name: "Enterprise", enterprise: true)
      account = insert(:account)
      insert(:platform_subscription, account: account, plan: plan)
      user = insert(:user, account: account)

      {:ok, res} = Account.invoke(%{"email" => user.email})
      {:ok, parsed} = Jason.decode(res)

      assert parsed["id"] == user.id
      assert parsed["account"]["id"] == account.id
      assert parsed["account"]["subscription"]["plan"]["id"] == plan.id
    end
  end
end
