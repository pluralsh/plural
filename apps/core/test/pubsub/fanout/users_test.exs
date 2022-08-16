defmodule Core.PubSub.Fanout.UsersTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Accounts
  alias Core.Services.Users
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

  describe "UserUpdated" do
    test "it will send an email confirmation link" do
      user = insert(:user)
      {:ok, updated} = Users.update_user(%{email: "changed@example.com"}, user)

      event = %PubSub.UserUpdated{item: updated}
      {:ok, reset} = Core.PubSub.Fanout.fanout(event)

      assert reset.type == :email
      assert reset.email == updated.email
    end

    test "it will not send an email confirmation link" do
      user = insert(:user)
      {:ok, updated} = Users.update_user(%{name: "changed", email: user.email}, user)

      event = %PubSub.UserUpdated{item: updated}
      :ignore = Core.PubSub.Fanout.fanout(event)
    end
  end
end
