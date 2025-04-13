defmodule Core.MCP.Tools.RemoveEnterpriseTest do
  use Core.SchemaCase, async: true
  alias Core.MCP.Tools.RemoveEnterprise

  describe "invoke/1" do
    test "it will fetch a users account info" do
      plan = insert(:platform_plan, name: "Enterprise", enterprise: true)
      account = insert(:account)
      sub = insert(:platform_subscription, account: account, plan: plan)

      {:ok, res} = RemoveEnterprise.invoke(%{"account_id" => account.id})

      assert is_binary(res)
      refute refetch(sub)
    end
  end
end
