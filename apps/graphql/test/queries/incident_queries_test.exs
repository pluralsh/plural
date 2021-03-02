defmodule GraphQl.IncidentQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "incidents" do
    test "it will list incidents for a repo" do
      user = insert(:user)
      repo = insert(:repository)
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
  end
end
