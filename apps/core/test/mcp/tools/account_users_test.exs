defmodule Core.MCP.Tools.AccountUsersTest do
  use Core.SchemaCase, async: true
  alias Core.MCP.Tools.AccountUsers

  describe "invoke/1" do
    test "it will fetch a users account info" do
      account = insert(:account)
      user = insert(:user, account: account)

      {:ok, res} = AccountUsers.invoke(%{"account_id" => account.id})
      {:ok, [parsed]} = Jason.decode(res)

      assert parsed["id"] == user.id
      assert parsed["email"] == user.email
      assert parsed["name"] == user.name
    end
  end
end
