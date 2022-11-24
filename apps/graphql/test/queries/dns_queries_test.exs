defmodule Graphql.Queries.DnsTest do
  use Core.SchemaCase
  import GraphQl.TestHelpers

  describe "dnsDomains" do
    test "it can list domains for a user's account" do
      user = insert(:user)
      domains = insert_list(3, :dns_domain, account: user.account)
      insert(:dns_domain)

      {:ok, %{data: %{"dnsDomains" => found}}} = run_query("""
        query {
          dnsDomains(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(domains)
    end

    test "it can search domains for a user's account" do
      user = insert(:user)
      domain = insert(:dns_domain, account: user.account, name: "test domain")
      insert_list(3, :dns_domain, account: user.account)

      {:ok, %{data: %{"dnsDomains" => found}}} = run_query("""
        query Domains($q: String) {
          dnsDomains(first: 5, q: $q) {
            edges { node { id } }
          }
        }
      """, %{"q" => "test"}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal([domain])
    end
  end

  describe "dnsDomain" do
    test "It can fetch a dns domain and list records" do
      user = insert(:user)
      domain = insert(:dns_domain, account: user.account)
      records = insert_list(3, :dns_record, domain: domain)
      insert(:dns_record)

      {:ok, %{data: %{"dnsDomain" => found}}} = run_query("""
        query Domain($id: ID!) {
          dnsDomain(id: $id) {
            name
            dnsRecords(first: 5) {
              edges { node { id } }
            }
          }
        }
      """, %{"id" => domain.id}, %{current_user: user})

      assert found["name"] == domain.name
      assert from_connection(found["dnsRecords"])
             |> ids_equal(records)
    end
  end

  describe "dnsRecords" do
    test "it can list records for a domain" do
      user = insert(:user)
      domain = insert(:dns_domain, account: user.account)
      records = insert_list(3, :dns_record, domain: domain)
      insert(:dns_record)

      {:ok, %{data: %{"dnsRecords" => found}}} = run_query("""
        query Records($id: ID!) {
          dnsRecords(domainId: $id, first: 5) {
            edges { node { id } }
          }
        }
      """, %{"id" => domain.id}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(records)
    end

    test "it can list records for a cluster/provider" do
      user = insert(:user)
      domain = insert(:dns_domain)
      records = insert_list(3, :dns_record,
        domain: domain,
        creator: user,
        cluster: "clus",
        provider: :aws
      )
      insert(:dns_record)

      {:ok, %{data: %{"dnsRecords" => found}}} = run_query("""
        query Records($cluster: String!, $provider: Provider!) {
          dnsRecords(cluster: $cluster, provider: $provider, first: 5) {
            edges { node { id } }
          }
        }
      """, %{"cluster" => "clus", "provider" => "AWS"}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(records)
    end
  end
end
