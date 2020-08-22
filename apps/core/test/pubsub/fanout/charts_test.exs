defmodule Core.PubSub.Fanout.ChartsTest do
  use Core.SchemaCase, async: false
  use Mimic
  alias Core.PubSub

  setup :set_mimic_global

  describe "VersionCreated" do
    test "On version create it will bump all subscribing chart installations" do
      %{chart: chart} = chart_version = insert(:version, version: "0.1.0")
      auto_upgraded = for _ <- 1..3 do
        insert(:chart_installation,
          installation: insert(:installation, auto_upgrade: true),
          chart: chart,
          version: chart_version
        )
      end
      for %{installation: %{user: user}} <- auto_upgraded,
        do: insert(:webhook, user: user)

      ignored = insert_list(2, :chart_installation, chart: chart, version: chart_version)
      version = insert(:version, version: "0.1.1", chart: chart)
      insert(:version_tag, version: version, chart: chart, tag: "latest")
      pid = self()
      expect(Mojito, :post, 3, fn _, headers, _, _ -> send pid, {:post, headers} end)

      3 = Core.PubSub.Fanout.fanout(%PubSub.VersionCreated{item: version})
      assert_receive {:post, h1}
      assert_receive {:post, h2}
      assert_receive {:post, h3}

      assert Enum.all?([h1, h2, h3], &Enum.find(&1, fn {key, _} -> key == "x-watchman-signature" end))

      for bumped <- auto_upgraded,
        do: assert refetch(bumped).version_id == version.id

      for ignore <- ignored,
        do: assert refetch(ignore).version_id == chart_version.id
    end
  end

  describe "VersionUpdated" do
    test "On version update it will bump all subscribing chart installations" do
      %{chart: chart} = chart_version = insert(:version, version: "0.1.0")
      auto_upgraded = for _ <- 1..3 do
        insert(:chart_installation,
          installation: insert(:installation, auto_upgrade: true),
          chart: chart,
          version: chart_version
        )
      end
      for %{installation: %{user: user}} <- auto_upgraded,
        do: insert(:webhook, user: user)

      ignored = insert_list(2, :chart_installation, chart: chart, version: chart_version)
      version = insert(:version, version: "0.1.1", chart: chart)
      insert(:version_tag, version: version, chart: chart, tag: "latest")
      pid = self()
      expect(Mojito, :post, 3, fn _, headers, _, _ -> send pid, {:post, headers} end)

      3 = Core.PubSub.Fanout.fanout(%PubSub.VersionUpdated{item: version})
      assert_receive {:post, h1}
      assert_receive {:post, h2}
      assert_receive {:post, h3}

      assert Enum.all?([h1, h2, h3], &Enum.find(&1, fn {key, _} -> key == "x-watchman-signature" end))

      for bumped <- auto_upgraded,
        do: assert refetch(bumped).version_id == version.id

      for ignore <- ignored,
        do: assert refetch(ignore).version_id == chart_version.id
    end
  end
end