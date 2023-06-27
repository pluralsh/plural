defmodule Cron.Prune.TrialsTest do
  use Core.SchemaCase
  alias Cron.Prune.Trials

  describe "#run/0" do
    test "it will prune old stacks" do
      trial_plan = insert(:platform_plan, trial: true)
      old = insert_list(3, :platform_subscription, plan: trial_plan, inserted_at: Timex.now() |> Timex.shift(months: -5))
      insert(:platform_subscription)

      :ok = Trials.run()

      for s <- old,
        do: refute refetch(s)
    end
  end
end
