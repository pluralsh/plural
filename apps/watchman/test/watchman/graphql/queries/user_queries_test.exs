defmodule Watchman.GraphQl.UserQueriesTest do
  use Watchman.DataCase, async: true

  describe "users" do
    test "It can list all watchman users" do
      users = insert_list(3, :user)

      {:ok, %{data: %{"users" => found}}} = run_query("""
        query {
          users(first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{}, %{current_user: hd(users)})

      assert from_connection(found)
             |> ids_equal(users)
    end
  end

  describe "invite" do
    test "It can fetch an invite by secure id" do
      invite = insert(:invite, secure_id: "secure")

      {:ok, %{data: %{"invite" => found}}} = run_query("""
        query Invite($id: String!) {
          invite(id: $id) {
            email
          }
        }
      """, %{"id" => "secure"})

      assert found["email"] == invite.email
    end
  end
end