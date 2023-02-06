defmodule Core.Backfill.AccountsTest do
  use Core.SchemaCase, async: true
  alias Core.Backfill.Accounts

  describe "#usage/0" do
    test "it will properly compute usage for all accounts" do
      ac1 = insert(:account)
      [u | _] = insert_list(3, :user, account: ac1)
      insert(:user, account: ac1, service_account: true)
      insert(:upgrade_queue, user: u)
      insert(:upgrade_queue, user: u)

      ac2 = insert(:account)
      insert(:user, account: ac2)

      Accounts.usage()

      ac1 = refetch(ac1)
      assert ac1.user_count == 3
      assert ac1.cluster_count == 2

      ac2 = refetch(ac2)
      assert ac2.user_count == 1
      assert ac2.cluster_count == 0
    end
  end

  describe "#grandfather/0" do
    test "it will set the grandfather timestamp on all accounts" do
      accounts = insert_list(3, :account)

      {3, _} = Accounts.grandfather()

      for account <- accounts,
        do: assert refetch(account).grandfathered_until
    end
  end
end
