defmodule ApiWeb.PaymentsControllerTest do
  use ApiWeb.ConnCase, async: true
  use Mimic

  describe "#usage_record/2" do
    test "It can submit a new usage record given a license token", %{conn: conn} do
      user = insert(:user)
      repository = insert(:repository, publisher: build(:publisher, billing_account_id: "account_id"))
      installation = insert(:installation, user: user, repository: repository)
      plan = insert(:plan,
        repository: repository,
        external_id: "plan_id",
        line_items: %{items: [%{name: "mem", dimension: "memory", external_id: "id_stor", period: :monthly, type: :metered}]}
      )
      insert(:subscription, installation: installation, plan: plan, line_items: %{
        item_id: "some_id",
        items: [%{id: Ecto.UUID.generate(), external_id: "si_id", quantity: 1, dimension: "memory", type: :metered}]
      })

      expect(Stripe.SubscriptionItem.Usage, :create, fn
        "si_id", %{quantity: 50, action: :set, timestamp: _}, [connect_account: "account_id"] ->
          {:ok, %{}}
      end)

      license_token = insert(:license_token, installation: installation)

      conn
      |> authorized(license_token)
      |> post("/api/usage", %{dimension: "memory", quantity: 50})
      |> json_response(200)
    end
  end
end
