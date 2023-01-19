defmodule Cron.Task.UsageTest do
  use Core.SchemaCase, async: false

  describe "#run/0" do
    test "it will sync usage for all updated accounts" do
      accounts = insert_list(3, :account, usage_updated: true)
      insert(:account)

      3 = Cron.Task.Usage.run()

      for a <- accounts,
        do: refute refetch(a).usage_updated
    end
  end
end
