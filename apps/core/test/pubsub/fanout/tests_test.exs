defmodule Core.PubSub.Fanout.TestsTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub

  describe "TestUpdated" do
    test "it will promote succeeded tests" do
      test = insert(:test, status: :succeeded, promote_tag: "stable")
      insert_list(3, :test_binding, test: test)

      event = %PubSub.TestUpdated{item: test}
      {:ok, _} = Core.PubSub.Fanout.fanout(event)
    end

    test "it will ignore non-succeeded tests" do
      test = insert(:test, status: :queued, promote_tag: "stable")
      insert_list(3, :test_binding, test: test)

      event = %PubSub.TestUpdated{item: test}
      :ok = Core.PubSub.Fanout.fanout(event)
    end
  end
end
