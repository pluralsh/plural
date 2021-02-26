defmodule GraphQl.IncidentMutationsTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "createIncident" do
    test "installers can create incidents" do
      repo = insert(:repository)
      %{user: user} = insert(:installation, repository: repo)

      {:ok, %{data: %{"createIncident" => found}}} = run_query("""
        mutation Incidents($id: ID!, $attrs: IncidentAttributes!) {
          createIncident(repositoryId: $id, attributes: $attrs) {
            id title severity
          }
        }
      """, %{"id" => repo.id, "attrs" => %{"title" => "wtf", "severity" => 2}}, %{current_user: user})

      assert found["id"]
      assert found["title"] == "wtf"
      assert found["severity"] == 2
    end

    test "installers can create incidents with tags" do
      repo = insert(:repository)
      %{user: user} = insert(:installation, repository: repo)

      {:ok, %{data: %{"createIncident" => found}}} = run_query("""
        mutation Incidents($id: ID!, $attrs: IncidentAttributes!) {
          createIncident(repositoryId: $id, attributes: $attrs) {
            id title severity tags { tag }
          }
        }
      """, %{
        "id" => repo.id,
        "attrs" => %{
          "title" => "wtf", "severity" => 2, "tags" => [%{"tag" => "help"}]
        }
      }, %{current_user: user})

      assert found["id"]
      assert found["title"] == "wtf"
      assert found["severity"] == 2
      assert found["tags"] == [%{"tag" => "help"}]
    end
  end

  describe "updateIncident" do
    test "incident owners can update" do
      user = insert(:user)
      incident = insert(:incident, owner: user)

      {:ok, %{data: %{"updateIncident" => updated}}} = run_query("""
        mutation Update($id: ID!, $attrs: IncidentAttributes!) {
          updateIncident(id: $id, attributes: $attrs) {
            id
            title
          }
        }
      """, %{"id" => incident.id, "attrs" => %{"title" => "updated"}}, %{current_user: user})

      assert updated["id"] == incident.id
      assert updated["title"] == "updated"
    end
  end

  describe "createMessage" do
    test "it can create a message" do
      incident = insert(:incident)

      {:ok, %{data: %{"createMessage" => msg}}} = run_query("""
        mutation Create($id: ID!, $attrs: IncidentMessageAttributes!) {
          createMessage(incidentId: $id, attributes: $attrs) {
            id
            text
            incident { id }
          }
        }
      """, %{"id" => incident.id, "attrs" => %{"text" => "created"}}, %{current_user: incident.creator})

      assert msg["incident"]["id"] == incident.id
      assert msg["text"] == "created"
    end
  end

  describe "updateMessage" do
    test "it can update a message" do
      message = insert(:incident_message)

      {:ok, %{data: %{"updateMessage" => msg}}} = run_query("""
        mutation Update($id: ID!, $attrs: IncidentMessageAttributes!) {
          updateMessage(id: $id, attributes: $attrs) {
            id
            text
            incident { id }
          }
        }
      """, %{"id" => message.id, "attrs" => %{"text" => "updated"}}, %{current_user: message.creator})

      assert msg["id"] == message.id
      assert msg["text"] == "updated"
    end
  end

  describe "deleteMessage" do
    test "it can delete a message" do
      message = insert(:incident_message)

      {:ok, %{data: %{"deleteMessage" => msg}}} = run_query("""
        mutation Create($id: ID!) {
          deleteMessage(id: $id) { id }
        }
      """, %{"id" => message.id}, %{current_user: message.creator})

      assert msg["id"] == message.id
      refute refetch(message)
    end
  end
end
