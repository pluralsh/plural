defmodule Cron.Task.MeteringTest do
  use Core.SchemaCase, async: false
  use Mimic
  alias Cron.Task.Metering

  setup :set_mimic_global

  describe "#run/0" do
    test "it will sync usage for all updated accounts" do
      account = insert(:account, billing_customer_id: "cus_1")
      insert(:platform_subscription, account: account, billing_version: 1)
      insert(:cluster, account: account, cluster_count: 2)
      insert(:cluster, account: account, cluster_count: 4)
      expect(Stripe.API, :request, fn
        %{
          event_name: "pro_clusters",
          payload: %{stripe_customer_id: "cus_1", value: 6}
        }, :post, "/v1/billing/meter_events", %{}, [api_version: "2024-06-20"] ->
        {:ok, "id_1"}
      end)

      1 = Metering.run()
    end
  end
end
