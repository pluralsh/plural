defmodule Cron.Task.VersionScanTest do
  use Core.SchemaCase, async: false
  alias Cron.Task.VersionScan
  alias Core.Schema.Version

  use Mimic

  setup :set_mimic_global

  describe "#run/0" do
    test "it will scan old images" do
      versions = insert_list(3, :version)

      me = self()
      expect(Core.Conduit.Broker, :publish, 3, fn %{body: vsn}, :scan -> send(me, {:scan, vsn}) end)

      3 = VersionScan.run()

      for %{id: id} <- versions do
        assert_receive {:scan, %Version{id: ^id}}
      end
    end
  end
end
