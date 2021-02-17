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

      {:ok, %{data: %{"incident" => found}}} = run_query("""
        query Incident($id: ID!) {
          incident(id: $id) { id }
        }
      """, %{"id" => incident.id}, %{current_user: user})

      assert found["id"] == incident.id
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
  end
end
