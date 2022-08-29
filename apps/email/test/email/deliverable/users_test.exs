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

    test "it can send email confirmations" do
      token = insert(:reset_token, type: :email)

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

  describe "InviteCreated" do
    test "it can send an invite created email for existing users" do
      account = insert(:account, root_user: build(:user))
      invite = insert(:invite, account: account, user: build(:user))

      event = %PubSub.InviteCreated{item: invite}
      Consumer.handle_event(event)

      assert_delivered_email Email.Builder.Invite.email(invite)
    end

    test "it will ignore email delivery for non existing users" do
      account = insert(:account, root_user: build(:user))
      invite = insert(:invite, account: account)

      event = %PubSub.InviteCreated{item: invite}
      Consumer.handle_event(event)

      refute_delivered_email Email.Builder.Invite.email(invite)
    end
  end
end
