defmodule Email.Deliverable.UsersTest do
  use Core.SchemaCase, async: true
  use Bamboo.Test

  alias Core.PubSub
  alias Email.PubSub.Consumer

  describe "ResetTokenCreated" do
    test "it can send reset emails" do
      token = insert(:reset_token)

      event = %PubSub.ResetTokenCreated{item: token}
      Consumer.handle_event(event)

      assert_delivered_email Email.Builder.ResetToken.email(token)
    end
  end
end
