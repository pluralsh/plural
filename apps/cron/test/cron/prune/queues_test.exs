defmodule Cron.Prune.QueuesTest do
  use Core.SchemaCase
  alias Cron.Prune.Queues

  describe "#run/0" do
    test "it will prune old, unused upgrade queues" do
      old = insert_list(3, :upgrade_queue, pinged_at: Timex.now() |> Timex.shift(days: -15))
      insert(:upgrade_queue)

      Queues.run()

      for q <- old,
        do: refute refetch(q)
    end
  end
end
