defmodule GraphQl.AccountQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "groups" do
    setup [:setup_root_user]

    test "it can list groups for a account", %{user: user, account: account} do
      groups = insert_list(3, :group, account: account)
      {:ok, %{data: %{"groups" => found}}} = run_query("""
        query {
          groups(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(groups)
    end

    test "it can search groups by name", %{user: user, account: account} do
      insert_list(3, :group, account: account)
      group = insert(:group, account: account, name: "query")

      {:ok, %{data: %{"groups" => found}}} = run_query("""
        query Groups($q: String) {
          groups(first: 5, q: $q) {
            edges { node { id } }
          }
        }
      """, %{"q" => "quer"}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal([group])
    end
  end

  describe "groupMembers" do
    setup [:setup_root_user]

    test "it can list members for a group", %{user: user, account: account} do
      group = insert(:group, account: account)
      members = insert_list(3, :group_member, group: group)

      {:ok, %{data: %{"groupMembers" => found}}} = run_query("""
        query members($id: ID!) {
          groupMembers(first: 5, groupId: $id) {
            edges { node { id } }
          }
        }
      """, %{"id" => group.id}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(members)
    end
  end

  describe "invite" do
    test "it can fetch an invite" do
      invite = insert(:invite)

      {:ok, %{data: %{"invite" => found}}} = run_query("""
        query Invite($id: String!) {
          invite(id: $id) { email }
        }
      """, %{"id" => invite.secure_id})

      assert found["email"] == invite.email
    end
  end

  describe "role" do
    setup [:setup_root_user]
    test "it can fetch a role by id", %{user: user, account: account} do
      role = insert(:role, account: account)

      {:ok, %{data: %{"role" => found}}} = run_query("""
        query Role($id: ID!) {
          role(id: $id) { id }
        }
      """, %{"id" => role.id}, %{current_user: user})

      assert found["id"] == role.id
    end
  end

  describe "roles" do
    setup [:setup_root_user]
    test "it can fetch a role by id", %{user: user, account: account} do
      roles = insert_list(3, :role, account: account)

      {:ok, %{data: %{"roles" => found}}} = run_query("""
        query {
          roles(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(roles)
    end
  end

  describe "integrationWebhooks" do
    setup [:setup_root_user]

    test "it can list webhooks for an account", %{user: user, account: account} do
      webhooks = insert_list(3, :integration_webhook, account: account)

      {:ok, %{data: %{"integrationWebhooks" => found}}} = run_query("""
        query {
          integrationWebhooks(first: 5) { edges { node { id } } }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(webhooks)
    end
  end

  describe "integrationWebhook" do
    setup [:setup_root_user]

    test "it can list webhook logs", %{user: user, account: account} do
      webhook = insert(:integration_webhook, account: account)
      logs    = insert_list(3, :webhook_log, webhook: webhook)

      {:ok, %{data: %{"integrationWebhook" => found}}} = run_query("""
        query Hook($id: ID!) {
          integrationWebhook(id: $id) {
            id
            logs(first: 5) { edges { node { id } } }
          }
        }
      """, %{"id" => webhook.id}, %{current_user: user})

      assert found["id"] == webhook.id
      assert from_connection(found["logs"])
             |> ids_equal(logs)
    end
  end

  describe "oauthIntegrations" do
    setup [:setup_root_user]

    test "it can list oauth integrations", %{user: user, account: account} do
      oauth = insert(:oauth_integration, account: account)

      {:ok, %{data: %{"oauthIntegrations" => [found]}}} = run_query("""
        query { oauthIntegrations { id } }
      """, %{}, %{current_user: user})

      assert found["id"] == oauth.id
    end
  end
end
