defmodule Core.PubSub.Fanout.UsersTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub

  describe "UserCreated" do
    test "it will send an email confirmation link" do
      user = insert(:user)

      event = %PubSub.UserCreated{item: user}
      {:ok, reset} = Core.PubSub.Fanout.fanout(event)

      assert reset.type == :email
      assert reset.email == user.email
    end
  end
end
