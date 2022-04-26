defmodule Core.WorkOS.Handler.ConnectionsTest do
  use Core.SchemaCase, async: true
  alias Core.WorkOS.{Event, Resources, Handler}

  describe "ConnectionActivated" do
    test "it will toggle sso and create an org" do
      mapping = insert(:domain_mapping)
      payload = Jason.encode!(%{
        event: "connection.activated",
        data: %{id: "conn_id", organization_id: "org", domains: [%{domain: mapping.domain}]}
      })

      event = Jason.decode!(payload) |> Event.parse()
      Handler.handle(event)

      mapping = refetch(mapping)
      assert mapping.enable_sso
      assert mapping.workos_connection_id == "conn_id"

      org = Resources.get_organization("org")
      assert org.account_id == mapping.account_id
    end
  end

  describe "ConnectionDeactivated" do
    test "it will toggle off sso" do
      mapping = insert(:domain_mapping, enable_sso: true, workos_connection_id: "conn_id")
      payload = Jason.encode!(%{
        event: "connection.deactivated",
        data: %{organization_id: "org", domains: [%{domain: mapping.domain}]}
      })

      event = Jason.decode!(payload) |> Event.parse()
      Handler.handle(event)

      mapping = refetch(mapping)
      refute mapping.enable_sso
      refute mapping.workos_connection_id
    end
  end

  describe "ConnectionDeleted" do
    test "it will toggle off sso on deletion" do
      mappings = insert_list(2, :domain_mapping, enable_sso: true, workos_connection_id: "conn_id")
      payload = Jason.encode!(%{
        event: "connection.deleted",
        data: %{id: "conn_id", organization_id: "org"}
      })

      event = Jason.decode!(payload) |> Event.parse()
      Handler.handle(event)

      for mapping <- mappings do
        mapping = refetch(mapping)
        refute mapping.enable_sso
        refute mapping.workos_connection_id
      end
    end
  end
end
