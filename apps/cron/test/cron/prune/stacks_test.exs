defmodule Cron.Prune.StacksTest do
  use Core.SchemaCase
  alias Cron.Prune.Stacks

  describe "#run/0" do
    test "it will prune old stacks" do
      old = insert_list(3, :stack, expires_at: Timex.now() |> Timex.shift(minutes: -5))
      insert(:stack, expires_at: Timex.now() |> Timex.shift(minutes: 5))

      {3, _} = Stacks.run()

      for s <- old,
        do: refute refetch(s)
    end
  end
end
