defmodule GraphQl.AuditQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "audits" do
    test "it will list audits for a user's account" do
      user = insert(:user)
      audits = insert_list(3, :audit, account: user.account)
      enable_features(user.account, [:audit])
      insert(:audit)

      {:ok, %{data: %{"audits" => found}}} = run_query("""
        query {
          audits(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: Core.Services.Rbac.preload(user)})

      assert from_connection(found)
             |> ids_equal(audits)
    end

    test "it will fail if the feature is not enabled" do
      user = insert(:user)
      insert_list(3, :audit, account: user.account)
      insert(:audit)

      {:ok, %{errors: [_ | _]}} = run_query("""
        query {
          audits(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: user})
    end
  end

  describe "auditMetrics" do
    test "it will aggregate country level audit log stats" do
      user = insert(:user)
      enable_features(user.account, [:audit])
      insert_list(3, :audit, account: user.account, country: "US")
      insert_list(2, :audit, account: user.account, country: "CN")
      insert(:audit, country: "UK")

      {:ok, %{data: %{"auditMetrics" => metrics}}} = run_query("""
        query {
          auditMetrics { country count }
        }
      """, %{}, %{current_user: Core.Services.Rbac.preload(user)})

      grouped = Enum.into(metrics, %{}, & {&1["country"], &1["count"]})

      assert grouped["US"] == 3
      assert grouped["CN"] == 2
      refute grouped["UK"]
    end

    test "it will fail if the feature is not enabled" do
      user = insert(:user)
      insert_list(3, :audit, account: user.account, country: "US")
      insert_list(2, :audit, account: user.account, country: "CN")
      insert(:audit, country: "UK")

      {:ok, %{errors: [_ | _]}} = run_query("""
        query {
          auditMetrics { country count }
        }
      """, %{}, %{current_user: Core.Services.Rbac.preload(user)})
    end
  end
end
