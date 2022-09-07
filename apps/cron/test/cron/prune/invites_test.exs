defmodule Cron.Prune.InvitesTest do
  use Core.SchemaCase
  alias Cron.Prune.Invites

  describe "#run/0" do
    test "it will prune old, unused upgrade queues" do
      old = insert_list(3, :invite, inserted_at: Timex.now() |> Timex.shift(days: -3))
      inv = insert(:invite)

      {3, _} = Invites.run()

      for q <- old,
        do: refute refetch(q)

      assert refetch(inv)
    end
  end
end
