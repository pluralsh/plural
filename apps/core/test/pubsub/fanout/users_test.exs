defmodule Core.PubSub.Fanout.UsersTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Accounts
  alias Core.PubSub

  describe "UserCreated" do
    test "it will send an email confirmation link" do
      user = insert(:user)

      event = %PubSub.UserCreated{item: user}
      {:ok, reset} = Core.PubSub.Fanout.fanout(event)

      assert reset.type == :email
      assert reset.email == user.email
    end

    test "it will add the user to any global groups" do
      user = insert(:user)
      groups = insert_list(2, :group, account: user.account, global: true)
      ignore = insert(:group, account: user.account, global: false)

      event = %PubSub.UserCreated{item: user}
      {:ok, _} = Core.PubSub.Fanout.fanout(event)

      for g <- groups,
        do: assert Accounts.get_group_member(g.id, user.id)

      refute Accounts.get_group_member(ignore.id, user.id)
    end
  end
end
