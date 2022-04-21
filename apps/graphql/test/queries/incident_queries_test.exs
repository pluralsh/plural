defmodule GraphQl.IncidentQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "incidents" do
    test "it will list incidents for a repo" do
      repo = insert(:repository)
      user = insert(:user, account: repo.publisher.account)
      role = insert(:role, repositories: ["*"], permissions: %{support: true}, account: repo.publisher.account)
      insert(:role_binding, role: role, user: user)
      incidents = insert_list(3, :incident, repository: repo)

      {:ok, %{data: %{"incidents" => found}}} = run_query("""
        query Incidents($id: ID!) {
          incidents(repositoryId: $id, first: 5) {
            edges {
              node { id }
            }
          }
        }
      """, %{"id" => repo.id}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(incidents)
    end

    test "it will list incidents for supported repos" do
      account = insert(:account)
      repo = insert(:repository, publisher: build(:publisher, account: account))
      user = insert(:user, account: account)
      role = insert(:role, repositories: ["*"], permissions: %{support: true}, account: account)
      insert(:role_binding, role: role, user: user)
      incidents = insert_list(3, :incident, repository: repo)

      {:ok, %{data: %{"incidents" => found}}} = run_query("""
        query {
          incidents(supports: true, first: 5) {
            edges {
              node { id }
            }
          }
        }
      """, %{}, %{current_user: Core.Services.Rbac.preload(user)})

      assert from_connection(found)
             |> ids_equal(incidents)
    end

    test "it will list incidents by creator if no repo specified" do
      user = insert(:user)
      incidents = insert_list(3, :incident, creator: user)
      insert(:incident)

      {:ok, %{data: %{"incidents" => found}}} = run_query("""
        query {
          incidents(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(incidents)
    end

    test "it will allow external tokens" do
      user = insert(:user)
      incidents = insert_list(3, :incident, creator: user)
      insert(:incident)

      {:ok, %{data: %{"incidents" => found}}} = run_query("""
        query {
          incidents(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: %{user | external: true}})

      assert from_connection(found)
             |> ids_equal(incidents)
    end

    test "it will apply notification filters" do
      user = insert(:user)
      [incident | _] = insert_list(3, :incident, creator: user)
      insert(:notification, incident: incident, user: user)

      {:ok, %{data: %{"incidents" => found}}} = run_query("""
        query Inc($filters: [IncidentFilter]) {
          incidents(first: 5, filters: $filters) {
            edges { node { id } }
          }
        }
      """, %{"filters" => [%{"type" => "NOTIFICATIONS"}]}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal([incident])
    end

    test "it will apply follow filters" do
      user = insert(:user)
      [incident | _] = insert_list(3, :incident, creator: user)
      insert(:follower, incident: incident, user: user)

      {:ok, %{data: %{"incidents" => found}}} = run_query("""
        query Inc($filters: [IncidentFilter]) {
          incidents(first: 5, filters: $filters) {
            edges { node { id } }
          }
        }
      """, %{"filters" => [%{"type" => "FOLLOWING"}]}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal([incident])
    end

    test "it will apply tag filters" do
      user = insert(:user)
      [incident | _] = insert_list(3, :incident, creator: user)
      insert(:tag, resource_id: incident.id, resource_type: :incident, tag: "tag")

      {:ok, %{data: %{"incidents" => found}}} = run_query("""
        query Inc($filters: [IncidentFilter]) {
          incidents(first: 5, filters: $filters) {
            edges { node { id } }
          }
        }
      """, %{"filters" => [%{"type" => "TAG", "value" => "tag"}]}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal([incident])
    end

    test "it can sort" do
      user = insert(:user)
      incidents = for i <- 1..3, do: insert(:incident, title: "title #{i}", creator: user)

      {:ok, %{data: %{"incidents" => found}}} = run_query("""
        query {
          incidents(sort: TITLE, order: ASC, first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found) |> ids() == ids(incidents)
    end

    test "it can sideload notification counts" do
      user = insert(:user)
      incidents = insert_list(3, :incident, creator: user)
      insert(:incident)
      for incident <- incidents, do: insert(:notification, user: user, incident: incident)

      {:ok, %{data: %{"incidents" => found}}} = run_query("""
        query {
          incidents(first: 5) {
            edges { node { id notificationCount } }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(incidents)
      assert from_connection(found)
             |> Enum.all?(& &1["notificationCount"] == 1)
    end

    test "it can sideload subscriptions" do
      user = insert(:user)
      incidents = for _ <- 1..3 do
        repo = insert(:repository)
        inc = insert(:incident, creator: user, repository: repo)
        sub = insert(:subscription, installation: build(:installation, user: user, repository: repo))
        {inc, sub}
      end

      {:ok, %{data: %{"incidents" => found}}} = run_query("""
        query {
          incidents(first: 5) {
            edges { node { id subscription { id } } }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(Enum.map(incidents, &elem(&1, 0)))
      assert from_connection(found)
             |> Enum.map(& &1["subscription"])
             |> ids_equal(Enum.map(incidents, &elem(&1, 1)))
    end

    test "it will list search incidents" do
      user = insert(:user)
      insert_list(3, :incident, creator: user)
      incidents = insert_list(2, :incident, creator: user, title: "search")
      insert(:incident)

      {:ok, %{data: %{"incidents" => found}}} = run_query("""
        query Inc($q: String) {
          incidents(first: 5, q: $q) {
            edges { node { id } }
          }
        }
      """, %{"q" => "search"}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(incidents)
    end

    test "it will list your account's incidents for a repo if not a maintainer" do
      user = insert(:user)
      repo = insert(:repository)
      insert_list(3, :incident, repository: repo)
      incident = insert(:incident, repository: repo, creator: user)

      {:ok, %{data: %{"incidents" => found}}} = run_query("""
        query Incidents($id: ID!) {
          incidents(repositoryId: $id, first: 5) {
            edges {
              node { id }
            }
          }
        }
      """, %{"id" => repo.id}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal([incident])
    end
  end

  describe "incident" do
    test "users on the account that created the incident can view" do
      incident = insert(:incident)
      user = insert(:user, account: incident.creator.account)
      follow = insert(:follower, incident: incident, user: user)

      {:ok, %{data: %{"incident" => found}}} = run_query("""
        query Incident($id: ID!) {
          incident(id: $id) {
            id
            follower { id }
          }
        }
      """, %{"id" => incident.id}, %{current_user: user})

      assert found["id"] == incident.id
      assert found["follower"]["id"] == follow.id
    end

    test "users on the account that received the incident can view" do
      user = insert(:user)
      incident = insert(:incident, owner: user)
      viewer = insert(:user, account: user.account)

      {:ok, %{data: %{"incident" => found}}} = run_query("""
        query Incident($id: ID!) {
          incident(id: $id) { id }
        }
      """, %{"id" => incident.id}, %{current_user: viewer})

      assert found["id"] == incident.id
    end

    test "it can list messages for an incident" do
      incident = insert(:incident)
      messages = insert_list(3, :incident_message, incident: incident)

      {:ok, %{data: %{"incident" => found}}} = run_query("""
        query Incident($id: ID!) {
          incident(id: $id) {
            messages(first: 5) {
              edges { node { id } }
            }
          }
        }
      """, %{"id" => incident.id}, %{current_user: incident.creator})

      assert from_connection(found["messages"])
             |> ids_equal(messages)
    end

    test "it can list files for an incident" do
      incident = insert(:incident)
      files = for _ <- 1..3,
        do: insert(:file, message: build(:incident_message, incident: incident))

      {:ok, %{data: %{"incident" => found}}} = run_query("""
        query Incident($id: ID!) {
          incident(id: $id) {
            files(first: 5) {
              edges { node { id } }
            }
          }
        }
      """, %{"id" => incident.id}, %{current_user: incident.creator})

      assert from_connection(found["files"])
             |> ids_equal(files)
    end

    test "it can list history for an incident" do
      incident = insert(:incident)
      history = insert_list(3, :incident_history, incident: incident)

      {:ok, %{data: %{"incident" => found}}} = run_query("""
        query Incident($id: ID!) {
          incident(id: $id) {
            history(first: 5) {
              edges { node { id } }
            }
          }
        }
      """, %{"id" => incident.id}, %{current_user: incident.creator})

      assert from_connection(found["history"])
             |> ids_equal(history)
    end

    test "it can list followers for an incident" do
      incident = insert(:incident)
      followers = insert_list(3, :follower, incident: incident)

      {:ok, %{data: %{"incident" => found}}} = run_query("""
        query Incident($id: ID!) {
          incident(id: $id) {
            followers(first: 5) {
              edges { node { id } }
            }
          }
        }
      """, %{"id" => incident.id}, %{current_user: incident.creator})

      assert from_connection(found["followers"])
             |> ids_equal(followers)
    end
  end

  describe "notifications" do
    test "it can list notifications for a user" do
      user   = insert(:user)
      notifs = insert_list(3, :notification, user: user)

      {:ok, %{data: %{"notifications" => found}}} = run_query("""
        query {
          notifications(first: 5) { edges { node { id } } }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(notifs)
    end

    test "it can filter notifications by incident" do
      user   = insert(:user)
      incident = insert(:incident)
      notifs = insert_list(3, :notification, incident: incident, user: user)
      insert(:notification, user: user)

      {:ok, %{data: %{"notifications" => found}}} = run_query("""
        query notif($id: ID!) {
          notifications(incidentId: $id, first: 5) { edges { node { id } } }
        }
      """, %{"id" => incident.id}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(notifs)
    end

    test "it can filter notifications by cli flag" do
      user   = insert(:user)
      notifs = insert_list(3, :notification, cli: true, user: user)
      insert(:notification, user: user)

      {:ok, %{data: %{"notifications" => found}}} = run_query("""
        query {
          notifications(cli: true, first: 5) { edges { node { id } } }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(notifs)
    end
  end
end
