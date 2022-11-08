defmodule Cron.Task.DockerTest do
  use Core.SchemaCase, async: false
  alias Cron.Task.Docker
  alias Core.Schema.DockerImage

  use Mimic

  setup :set_mimic_global

  describe "#run/0" do
    test "it will scan old images" do
      old = Timex.now() |> Timex.shift(days: -20)
      imgs = insert_list(3, :docker_image, scanned_at: old, scan_completed_at: Timex.now())
      insert(:docker_image, scanned_at: Timex.now(), scan_completed_at: Timex.now())

      me = self()
      expect(Core.Conduit.Broker, :publish, 3, fn %{body: img}, :dkr -> send(me, {:scan, img}) end)

      3 = Docker.run()

      for %{id: id} <- imgs do
        assert_receive {:scan, %DockerImage{id: ^id}}
      end
    end
  end
end
