defmodule GraphQl.DnsMutationsTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers
  alias Cloudflare.DnsRecord
  use Mimic

  describe "createDomain" do
    test "A user can create a domain for his account" do
      user = insert(:user)

      {:ok, %{data: %{"createDomain" => found}}} = run_query("""
        mutation Create($name: String!) {
          createDomain(attributes: {name: $name}) {
            id
            name
          }
        }
      """, %{"name" => "some.onplural.sh"}, %{current_user: user})

      assert found["name"] == "some.onplural.sh"
    end
  end

  describe "updateDomain" do
    test "a creator can update their domains" do
      user = insert(:user)
      domain = insert(:dns_domain, account: user.account, creator: user)
      other_user = insert(:user, account: user.account)

      {:ok, %{data: %{"updateDomain" => found}}} = run_query("""
        mutation Update($id: ID!, $attrs: DnsDomainAttributes!) {
          updateDomain(id: $id, attributes: $attrs) {
            id
            accessPolicy { bindings { user { id } } }
          }
        }
      """, %{
        "id" => domain.id,
        "attrs" => %{"accessPolicy" => %{
          "bindings" => [%{"userId" => other_user.id}]
        }}
      }, %{current_user: user})

      assert found["id"] == domain.id
      %{"bindings" => [binding]} = found["accessPolicy"]
      assert binding["user"]["id"] == other_user.id
    end
  end

  describe "createDnsRecord" do
    test "A user can create a record for their account's domains" do
      user = insert(:user)
      insert(:dns_domain, name: "some.onplural.sh", account: user.account)
      external_id = "1234"
      expect(DnsRecord, :create, fn _, _ -> dns_resp(external_id) end)

      {:ok, %{data: %{"createDnsRecord" => found}}} = run_query("""
        mutation Create($attributes: DnsRecordAttributes!, $cluster: String!, $provider: Provider!) {
          createDnsRecord(attributes: $attributes, cluster: $cluster, provider: $provider) {
            id
            name
            type
            records
            cluster
            provider
          }
        }
      """, %{
        "cluster" => "cluster",
        "provider" => "AWS",
        "attributes" => %{
          "name" => "name.some.onplural.sh",
          "records" => ["1.2.3.4"],
          "type" => "A"
        }}, %{current_user: user})

      assert found["name"] == "name.some.onplural.sh"
      assert found["records"] == ["1.2.3.4"]
      assert found["type"] == "A"
      assert found["cluster"] == "cluster"
      assert found["provider"] == "AWS"
    end
  end

  describe "deleteRecord" do
    test "it can delete a dns record" do
      user = insert(:user)
      record = insert(:dns_record, creator: user)
      expect(DnsRecord, :delete, fn _ -> {:ok, %{}} end)

      {:ok, %{data: %{"deleteDnsRecord" => delete}}} = run_query("""
        mutation Delete($name: String!, $type: DnsRecordType!) {
          deleteDnsRecord(name: $name, type: $type) {
            id
          }
        }
      """, %{"name" => record.name, "type" => String.upcase("#{record.type}")}, %{current_user: user})

      assert delete["id"] == record.id
      refute refetch(record)
    end
  end

  defp dns_resp(external_id) do
    {:ok, %Tesla.Env{body: %{"result" => %{"id" => external_id}}}}
  end
end
