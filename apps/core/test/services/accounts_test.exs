defmodule Core.Services.AccountsTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Accounts

  describe "#update_account/2" do
    test "Root users can update accounts" do
      user = insert(:user)
      {:ok, %{user: user}} = Accounts.create_account(user)

      {:ok, account} = Accounts.update_account(%{name: "updated"}, user)

      assert account.name == "updated"
    end
  end
end