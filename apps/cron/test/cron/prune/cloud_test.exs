defmodule Cron.Prune.CloudTest do
  use Core.SchemaCase
  alias Cron.Prune.Cloud

  describe "#run/0" do
    test "it will prune old, unused invites" do
      old = Timex.now() |> Timex.shift(weeks: -1) |> Timex.shift(minutes: -30)
      account = insert(:account)
      user    = insert(:user, account: account)
      insert(:platform_subscription, account: account)

      first   = insert(:console_instance)
      ignore  = insert(:console_instance, owner: user)
      ignore2 = insert(:console_instance, first_notif_at: Timex.now())
      second  = insert(:console_instance, first_notif_at: old)
      third   = insert(:console_instance, first_notif_at: old, second_notif_at: old)

      Cloud.run()

      assert refetch(first).first_notif_at
      refute refetch(ignore).first_notif_at
      refute refetch(ignore2).second_notif_at
      assert refetch(second).second_notif_at
      assert refetch(third).deleted_at
    end
  end
end
