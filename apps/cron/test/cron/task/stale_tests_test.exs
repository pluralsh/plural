defmodule Cron.Task.StaleTestsTest do
  use Core.SchemaCase, async: false
  alias Cron.Task.StaleTests

  describe "#run/0" do
    test "it will scan old images" do
      old = Timex.now() |> Timex.shift(hours: -2)
      tests = insert_list(3, :test, status: :running, inserted_at: old)
      insert(:test, status: :running)
      insert(:test, status: :succeeded, inserted_at: old)

      3 = StaleTests.run()

      for t <- tests,
        do: assert refetch(t).status == :failed
    end
  end
end
