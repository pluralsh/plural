defmodule Email.Builder.TestEmailTest do
  use Core.SchemaCase, async: true
  alias Email.Builder.Test

  describe "#test_email/1" do
    test "it will build an email for a user" do
      user = insert(:user)

      email = Test.test_email(user)

      assert email.to == user
      assert email.text_body =~ user.email
      assert email.html_body =~ user.email
    end
  end
end
