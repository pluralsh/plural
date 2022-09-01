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

    test "users outside the roles account cannot view", %{user: user} do
      group = insert(:group)
      insert_list(3, :group_member, group: group)

      {:ok, %{errors: [_ | _]}} = run_query("""
        query members($id: ID!) {
          groupMembers(first: 5, groupId: $id) {
            edges { node { id } }
          }
        }
      """, %{"id" => group.id}, %{current_user: user})
    end
  end

  describe "invite" do
    test "it can fetch an invite" do
      invite = insert(:invite)

      {:ok, %{data: %{"invite" => found}}} = run_query("""
        query Invite($id: String!) {
          invite(id: $id) {
            email
            expiresAt
          }
        }
      """, %{"id" => invite.secure_id})

      assert found["email"] == invite.email
      assert found["expiresAt"]
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

    test "users outside the roles account cannot view", %{user: user} do
      role = insert(:role)

      {:ok, %{errors: [_ | _]}} = run_query("""
        query Role($id: ID!) {
          role(id: $id) { id }
        }
      """, %{"id" => role.id}, %{current_user: user})
    end
  end

  describe "roles" do
    setup [:setup_root_user]
    test "it can list a roles for an account", %{user: user, account: account} do
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

    test "it can list roles for a user", %{user: user, account: account} do
      role = insert(:role, account: account)
      role2 = insert(:role, account: account)
      role3 = insert(:role, account: account)
      insert(:role, account: account)

      group = insert(:group, account: account)
      insert(:group_member, user: user, group: group)
      insert(:group_member, group: group)

      insert(:role_binding, role: role, user: user)
      insert(:role_binding, role: role, user_id: nil, group: group)
      insert(:role_binding, role: role2, group: group)
      insert(:role_binding, role: role3, user: user)

      {:ok, %{data: %{"roles" => found}}} = run_query("""
        query Roles($userId: ID!) {
          roles(first: 5, userId: $userId) { edges { node { id } } }
        }
      """, %{"userId" => user.id}, %{current_user: user})

      assert length(found["edges"]) == 3
      assert from_connection(found)
             |> ids_equal([role, role2, role3])
    end

    test "it can search roles by name", %{user: user, account: account} do
      roles = for i <- 1..3, do: insert(:role, account: account, name: "search #{i}")
      insert(:role, account: account)

      {:ok, %{data: %{"roles" => found}}} = run_query("""
        query Roles($q: String) {
          roles(first: 5, q: $q) {
            edges { node { id } }
          }
        }
      """, %{"q" => "search"}, %{current_user: user})

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

  describe "configuration" do
    test "it can fetch plural's configuration" do
      {:ok, %{data: %{"configuration" => conf}}} = run_query("""
        query { configuration { registry stripeConnectId } }
      """, %{})

      assert conf["registry"]
      assert conf["stripeConnectId"]
    end
  end

  describe "invites" do
    setup [:setup_root_user]

    test "it can list invites for an account", %{user: user, account: account} do
      invites = insert_list(3, :invite, account: account)
      insert_list(2, :invite)

      {:ok, %{data: %{"invites" => found}}} = run_query("""
        query {
          invites(first: 5) { edges { node { id } } }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(invites)
    end
  end
end
