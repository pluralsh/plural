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
end
