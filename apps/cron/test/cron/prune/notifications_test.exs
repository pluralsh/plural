defmodule Cron.Prune.NotificationsTest do
  use Core.SchemaCase
  alias Cron.Prune.Notifications

  describe "#run/0" do
    test "it will prune old notifications" do
      old = insert_list(3, :notification, inserted_at: Timex.now() |> Timex.shift(months: -2))
      notif = insert(:notification)

      {3, _} = Notifications.run()

      for n <- old,
        do: refute refetch(n)

      assert refetch(notif)
    end
  end
end
