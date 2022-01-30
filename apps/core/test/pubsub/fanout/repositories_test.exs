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

  describe "LicensePing" do
    test "if there's no ping set, it will record" do
      inst = insert(:installation)

      event = %PubSub.LicensePing{item: inst}
      {:ok, up} = PubSub.Fanout.fanout(event)

      assert up.pinged_at
    end

    test "if pinged_at is stale, it will update" do
      inst = insert(:installation, pinged_at: Timex.now() |> Timex.shift(hours: -3))

      event = %PubSub.LicensePing{item: inst}
      {:ok, up} = PubSub.Fanout.fanout(event)

      assert Timex.after?(up.pinged_at, inst.pinged_at)
    end

    test "if pinged_at is recent, it will ignore" do
      inst = insert(:installation, pinged_at: Timex.now())

      event = %PubSub.LicensePing{item: inst}
      :ok = PubSub.Fanout.fanout(event)
    end
  end
end
