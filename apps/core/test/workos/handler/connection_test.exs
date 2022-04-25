defmodule Core.WorkOS.Handler.ConnectionsTest do
  use Core.SchemaCase, async: true
  alias Core.WorkOS.{Event, Resources, Handler}

  describe "ConnectionActivated" do
    test "it will toggle sso and create an org" do
      mapping = insert(:domain_mapping)
      payload = Jason.encode!(%{
        event: "connection.activated",
        data: %{organization_id: "org", domains: [%{domain: mapping.domain}]}
      })

      event = Jason.decode!(payload) |> Event.parse()
      Handler.handle(event)

      assert refetch(mapping).enable_sso

      org = Resources.get_organization("org")
      assert org.account_id == mapping.account_id
    end
  end

  describe "ConnectionDeactivated" do
    test "it will toggle off sso" do
      mapping = insert(:domain_mapping)
      payload = Jason.encode!(%{
        event: "connection.deactivated",
        data: %{organization_id: "org", domains: [%{domain: mapping.domain}]}
      })

      event = Jason.decode!(payload) |> Event.parse()
      Handler.handle(event)

      refute refetch(mapping).enable_sso
    end
  end
end
