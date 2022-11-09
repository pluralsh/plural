defmodule GraphQl.UserQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  use Mimic

  describe "me" do
    test "It will return the current user" do
      user = insert(:user)
      insert(:role_binding, user: user, group_id: nil)

      {:ok, %{data: %{"me" => me}}} = run_query("""
        query {
          me {
            id
            name
            boundRoles { id }
          }
        }
      """, %{}, %{current_user: Core.Services.Rbac.preload(user)})

      assert me["id"] == user.id
      assert me["name"] == user.name
      assert length(me["boundRoles"]) == 1
    end
  end

  describe "publisher" do
    test "It will fetch your publisher" do
      %{owner: user} = publisher = insert(:publisher)

      {:ok, %{data: %{"publisher" => found}}} = run_query("""
        query {
          publisher {
            id
          }
        }
      """, %{}, %{current_user: user})

      assert found["id"] == publisher.id
    end
  end

  describe "users" do
    test "it can list users for an account" do
      account = insert(:account)
      users = insert_list(3, :user, account: account)
      insert(:user, account: account, service_account: true)
      insert(:user)

      {:ok, %{data: %{"users" => found}}} = run_query("""
        query {
          users(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: hd(users)})

      assert from_connection(found)
             |> ids_equal(users)
    end

    test "it can list service accounts for an account" do
      account = insert(:account)
      users = insert_list(3, :user, account: account)
      svcs = insert_list(3, :user, account: account, service_account: true)
      insert(:user)

      {:ok, %{data: %{"users" => found}}} = run_query("""
        query {
          users(first: 5, serviceAccount: true) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: hd(users)})

      assert from_connection(found)
             |> ids_equal(svcs)
    end

    test "it can list both svc and users for an account" do
      account = insert(:account)
      users = insert_list(2, :user, account: account)
      svcs = insert_list(2, :user, account: account, service_account: true)
      insert(:user)

      {:ok, %{data: %{"users" => found}}} = run_query("""
        query {
          users(first: 5, all: true) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: hd(users)})

      assert from_connection(found)
             |> ids_equal(svcs ++ users)
    end

    test "it can search users for an account" do
      account = insert(:account)
      user = insert(:user, account: account, name: "search name")
      insert_list(2, :user, account: account)
      insert(:user)

      {:ok, %{data: %{"users" => found}}} = run_query("""
        query Users($q: String) {
          users(first: 5, q: $q) {
            edges { node { id } }
          }
        }
      """, %{"q" => "search"}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal([user])
    end
  end

  describe "publishers" do
    test "It will list all publishers" do
      publishers = insert_list(3, :publisher)

      {:ok, %{data: %{"publishers" => found}}} = run_query("""
        query {
          publishers(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(publishers)
    end

    test "It can sideload repositories for publishers" do
      [first, second, _] = publishers = insert_list(3, :publisher)
      repos = insert_list(10, :repository, publisher: first)
      other_repos = insert_list(2, :repository, publisher: second)

      {:ok, %{data: %{"publishers" => found}}} = run_query("""
        query {
          publishers(first: 5) {
            edges {
              node {
                id
                repositories { id }
              }
            }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      found_publishers = from_connection(found)
      assert ids_equal(publishers, found_publishers)

      %{"repositories" => sideload} = Enum.find(found_publishers, & &1["id"] == first.id)
      assert length(sideload) == 5
      assert Enum.all?(sideload, fn %{"id" => id} -> Enum.find(repos, & &1.id == id) end)

      %{"repositories" => sideload} = Enum.find(found_publishers, & &1["id"] == second.id)
      assert length(sideload) == 2
      assert Enum.all?(sideload, fn %{"id" => id} -> Enum.find(other_repos, & &1.id == id) end)
    end

    test "it can filter by ids" do
      account = insert(:account)
      publishers = insert_list(3, :publisher, account: account)
      insert(:publisher)

      {:ok, %{data: %{"publishers" => found}}} = run_query("""
        query Publishers($id: ID!) {
          publishers(first: 5, accountId: $id) {
            edges { node { id } }
          }
        }
      """, %{"id" => account.id}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(publishers)
    end

    test "it can list publishable publishers for a users account" do
      account = insert(:account)
      user = insert(:user, account: account)
      publishers = insert_list(3, :publisher, account: account)
      role = insert(:role, repositories: ["*"], permissions: %{publish: true}, account: account)
      insert(:role_binding, user: user, role: role)
      user = Core.Services.Rbac.preload(user)

      {:ok, %{data: %{"publishers" => found}}} = run_query("""
        query {
          publishers(first: 5, publishable: true) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(publishers)
    end
  end

  describe "tokens" do
    test "It will list tokens for a user" do
      user = insert(:user)
      tokens = insert_list(3, :persisted_token, user: user)

      {:ok, %{data: %{"tokens" => found}}} = run_query("""
        query {
          tokens(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(tokens)
    end
  end

  describe "token" do
    test "it can fetch audits for a token" do
      token = insert(:persisted_token)
      audits = for i <- 1..3 do
        insert(:access_token_audit,
          token: token,
          timestamp: Timex.now() |> Timex.shift(minutes: -i)
        )
      end

      {:ok, %{data: %{"token" => found}}} = run_query("""
        query Token($id: ID!) {
          token(id: $id) {
            id
            audits(first: 10) { edges { node { id } } }
          }
        }
      """, %{"id" => token.id}, %{current_user: token.user})

      assert found["id"] == token.id
      assert from_connection(found["audits"])
             |> ids_equal(audits)
    end

    test "It can fetch audit metrics for a token" do
      token = insert(:persisted_token)
      insert_list(3, :access_token_audit, token: token, country: "US", count: 1)
      insert_list(2, :access_token_audit, token: token, country: "CN", count: 2)
      insert(:access_token_audit, country: "UK")

      {:ok, %{data: %{"token" => %{"metrics" => metrics}}}} = run_query("""
        query Token($id: ID!) {
          token(id: $id) {
            id
            metrics { country count }
          }
        }
      """, %{"id" => token.id}, %{current_user: token.user})

      grouped = Enum.into(metrics, %{}, & {&1["country"], &1["count"]})
      assert grouped["US"] == 3
      assert grouped["CN"] == 4
      refute grouped["UK"]
    end
  end

  describe "webhooks" do
    test "A user can list their webhooks" do
      user = insert(:user)
      webhooks = insert_list(3, :webhook, user: user)

      {:ok, %{data: %{"webhooks" => found}}} = run_query("""
        query {
          webhooks(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(webhooks)
    end
  end

  describe "searchUsers" do
    test "a user can list users associated with an incident" do
      account  = insert(:account)
      incident = insert(:incident, owner: insert(:user, account: account))
      users = for i <- 1..3, do: insert(:user, account: account, name: "search #{i}")

      {:ok, %{data: %{"searchUsers" => found}}} = run_query("""
        query Search($incidentId: ID!, $q: String!) {
          searchUsers(incidentId: $incidentId, q: $q, first: 5) {
            edges { node { id } }
          }
        }
      """, %{"incidentId" => incident.id, "q" => "search"}, %{current_user: incident.creator})

      assert from_connection(found)
             |> ids_equal(users)
    end
  end

  describe "resetToken" do
    test "it can fetch a reset token by external id" do
      token = insert(:reset_token)

      {:ok, %{data: %{"resetToken" => found}}} = run_query("""
        query Reset($id: ID!) {
          resetToken(id: $id) { id }
        }
      """, %{"id" => token.external_id})

      assert found["id"] == token.id
    end
  end

  describe "publicKeys" do
    test "it can list public keys for a user" do
      user = insert(:user)
      keys = insert_list(3, :public_key, user: user)
      insert(:public_key, user: build(:user, account: user.account))

      {:ok, %{data: %{"publicKeys" => found}}} = run_query("""
        query {
          publicKeys(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(keys)
    end

    test "it can list all the keys for users by their email" do
      user = insert(:user)
      keys = insert_list(3, :public_key, user: user)
      key = insert(:public_key, user: build(:user, account: user.account))

      {:ok, %{data: %{"publicKeys" => found}}} = run_query("""
        query Keys($emails: [String]) {
          publicKeys(emails: $emails, first: 5) {
            edges { node { id } }
          }
        }
      """, %{"emails" => [user.email, key.user.email]}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal([key | keys])
    end
  end

  describe "loginMethod" do
    test "it can fetch the login method for a user" do
      user = insert(:user, login_method: :passwordless)

      {:ok, %{data: %{"loginMethod" => method}}} = run_query("""
        query LoginMethod($email: String!) {
          loginMethod(email: $email) { loginMethod }
        }
      """, %{"email" => user.email})

      assert method["loginMethod"] == "PASSWORDLESS"
    end
  end

  describe "eabCredential" do
    test "it will fetch an eab credential for a user" do
      eab = insert(:eab_credential, provider: :aws)

      {:ok, %{data: %{"eabCredential" => found}}} = run_query("""
        query Eab($cluster: String!, $provider: Provider!) {
          eabCredential(cluster: $cluster, provider: $provider) {
            id
          }
        }
      """, %{"cluster" => eab.cluster, "provider" => "AWS"}, %{current_user: eab.user})

      assert found["id"] == eab.id
    end
  end

  describe "eabCredentials" do
    test "it will fetch the credentials for a user" do
      user = insert(:user)
      eabs = insert_list(3, :eab_credential, user: user)

      {:ok, %{data: %{"eabCredentials" => found}}} = run_query("""
        query {
          eabCredentials { id }
        }
      """, %{}, %{current_user: user})

      assert ids_equal(found, eabs)
    end
  end

  describe "keyBackups" do
    test "it will list key backups for a user" do
      user = insert(:user)
      backups = insert_list(3, :key_backup, user: user)

      {:ok, %{data: %{"keyBackups" => found}}} = run_query("""
        query {
          keyBackups(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(backups)
    end
  end

  describe "keyBackup" do
    test "it can fetch the secret from a backup" do
      user = insert(:user)
      backup = insert(:key_backup, user: user)

      path = backup.vault_path
      expect(Core.Clients.Vault, :read, fn ^path -> {:ok, "encryptionkey"} end)

      {:ok, %{data: %{"keyBackup" => found}}} = run_query("""
        query Backup($name: String!) {
          keyBackup(name: $name) {
            id
            value
          }
        }
      """, %{"name" => backup.name}, %{current_user: user})

      assert found["id"] == backup.id
      assert found["value"] == "encryptionkey"
    end
  end
end
