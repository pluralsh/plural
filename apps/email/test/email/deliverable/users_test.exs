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

  describe "PasswordlessLoginCreated" do
    test "it can send reset emails" do
      login = insert(:passwordless_login)

      event = %PubSub.PasswordlessLoginCreated{item: login}
      Consumer.handle_event(event)

      assert_delivered_email Email.Builder.PasswordlessLogin.email(login)
    end
  end
end
