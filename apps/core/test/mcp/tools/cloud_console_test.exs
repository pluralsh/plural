defmodule Core.MCP.Tools.CloudConsoleTest do
  use Core.SchemaCase, async: true
  alias Core.MCP.Tools.CloudConsole

  describe "invoke/1" do
    test "it will fetch a users account info" do
      plan = insert(:platform_plan, name: "Enterprise", enterprise: true)
      account = insert(:account)
      insert(:platform_subscription, account: account, plan: plan)
      user = insert(:user, account: account)
      inst = insert(:console_instance, owner: user)

      {:ok, res} = CloudConsole.invoke(%{"name" => inst.name})

      {:ok, %{"owner" => owner} = parsed} = Jason.decode(res)

      assert parsed["id"] == inst.id
      assert parsed["name"] == inst.name
      assert owner["id"] == user.id
      assert owner["account"]["id"] == account.id
      assert owner["account"]["subscription"]["plan"]["id"] == plan.id
    end
  end
end
