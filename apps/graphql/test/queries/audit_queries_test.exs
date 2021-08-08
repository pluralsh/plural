defmodule GraphQl.AuditQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "audits" do
    test "it will list audits for a user's account" do
      user = insert(:user)
      audits = insert_list(3, :audit, account: user.account)
      insert(:audit)

      {:ok, %{data: %{"audits" => found}}} = run_query("""
        query {
          audits(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(audits)
    end
  end

  describe "auditMetrics" do
    test "it will aggregate country level audit log stats" do
      user = insert(:user)
      insert_list(3, :audit, account: user.account, country: "US")
      insert_list(2, :audit, account: user.account, country: "CN")
      insert(:audit, country: "UK")

      {:ok, %{data: %{"auditMetrics" => metrics}}} = run_query("""
        query {
          auditMetrics { country count }
        }
      """, %{}, %{current_user: user})

      grouped = Enum.into(metrics, %{}, & {&1["country"], &1["count"]})

      assert grouped["US"] == 3
      assert grouped["CN"] == 2
      refute grouped["UK"]
    end
  end
end
