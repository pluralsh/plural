defmodule Core.PubSub.Fanout.InstallationsTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.PubSub

  describe "InstallationDeleted" do
    test "if a user no longer has a provider, it will nilify" do
      %{user: user} = inst = insert(:installation, user: build(:user, provider: :gcp))

      event = %PubSub.InstallationDeleted{item: inst, actor: user}
      {:ok, update} = PubSub.Fanout.fanout(event)

      assert update.id == user.id
      refute update.provider
    end
  end
end
