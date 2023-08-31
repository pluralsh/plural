defmodule Cron.Digest.PendingTest do
  use Core.SchemaCase, async: false
  use Bamboo.Test, shared: :true
  import Cron.Digest.Base, only: [compile: 2]
  alias Cron.Digest.Pending

  describe "#run/0" do
    test "it will prune old, unused upgrade queues" do
      [user1, user2] = users = insert_list(2, :user)
      for u <- users, do: insert(:cluster, owner: u)
      notifs = for _ <- 1..3, do: insert(:notification, user: user1, repository: insert(:repository), type: :pending)
      insert_list(2, :notification, user: user1, type: :locked)
      notifs2 = for _ <- 1..2, do: insert(:notification, user: user2, repository: insert(:repository), type: :pending)
      insert_list(3, :notification, type: :locked)

      :ok = Pending.run()

      {user, repos} = compile(user1.id, Enum.group_by(notifs, & &1.repository_id))
      assert_delivered_email Email.Builder.Digest.pending(user, repos)

      {user, repos} = compile(user2.id, Enum.group_by(notifs2, & &1.repository_id))
      assert_delivered_email Email.Builder.Digest.pending(user, repos)
    end
  end
end
