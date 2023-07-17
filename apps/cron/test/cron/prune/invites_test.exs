defmodule Cron.Prune.InvitesTest do
  use Core.SchemaCase
  alias Cron.Prune.Invites

  describe "#run/0" do
    test "it will prune old, unused invites" do
      old = insert_list(3, :invite, inserted_at: Timex.now() |> Timex.shift(days: -3))
      inv = insert(:invite)

      {3, _} = Invites.run()

      for i <- old,
        do: refute refetch(i)

      assert refetch(inv)
    end
  end
end
