defmodule Email.Deliverable.CloudTest do
  use Core.SchemaCase, async: true
  use Bamboo.Test

  alias Core.PubSub
  alias Email.PubSub.Consumer

  describe "ConsoleInstanceReaped" do
    test "it can send a first warning" do
      owner = insert(:user, service_account: true)
      insert(:impersonation_policy_binding,
        policy: build(:impersonation_policy, user: owner),
        user: build(:user)
      )
      inst = insert(:console_instance, owner: owner, first_notif_at: Timex.now())

      event = %PubSub.ConsoleInstanceReaped{item: inst}
      Consumer.handle_event(event)

      assert_delivered_email Email.Builder.ConsoleReaped.email(inst)
    end

    test "it can send a second warning email" do
      owner = insert(:user, service_account: true)
      insert(:impersonation_policy_binding,
        policy: build(:impersonation_policy, user: owner),
        user: build(:user)
      )
      inst = insert(:console_instance, owner: owner, second_notif_at: Timex.now())

      event = %PubSub.ConsoleInstanceReaped{item: inst}
      Consumer.handle_event(event)

      assert_delivered_email Email.Builder.ConsoleReaped.email(inst)
    end
  end
end
