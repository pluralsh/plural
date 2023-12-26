defmodule Cron.Task.MeteringTest do
  use Core.SchemaCase, async: false
  use Mimic
  alias Cron.Task.Metering

  setup :set_mimic_global

  describe "#run/0" do
    test "it will sync usage for all updated accounts" do
      account = insert(:account)
      insert(:platform_subscription, account: account, metered_id: "id_1")
      insert(:cluster, account: account, service_count: 2)
      insert(:cluster, account: account, service_count: 4)
      expect(Stripe.SubscriptionItem.Usage, :create, fn "id_1", %{action: :set, quantity: 2} -> {:ok, "id_1"} end)

      1 = Metering.run()
    end
  end
end
