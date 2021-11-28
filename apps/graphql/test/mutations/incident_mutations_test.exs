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

    test "installers can create incidents with tags and cluster info" do
      repo = insert(:repository)
      %{user: user} = insert(:installation, repository: repo)

      {:ok, %{data: %{"createIncident" => found}}} = run_query("""
        mutation Incidents($id: ID!, $attrs: IncidentAttributes!) {
          createIncident(repositoryId: $id, attributes: $attrs) {
            id title severity tags { tag }
            clusterInformation { version gitCommit }
          }
        }
      """, %{
        "id" => repo.id,
        "attrs" => %{
          "title" => "wtf", "severity" => 2, "tags" => [%{"tag" => "help"}],
          "clusterInformation" => %{"version" => "1.3", "gitCommit" => "341341"}
        }
      }, %{current_user: user})

      assert found["id"]
      assert found["title"] == "wtf"
      assert found["severity"] == 2
      assert found["tags"] == [%{"tag" => "help"}]
      assert found["clusterInformation"] == %{"version" => "1.3", "gitCommit" => "341341"}
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

  describe "deleteIncident" do
    test "responders can accept" do
      incident = insert(:incident)

      {:ok, %{data: %{"deleteIncident" => deleted}}} = run_query("""
        mutation Delete($id: ID!) {
          deleteIncident(id: $id) {
            id
          }
        }
      """, %{"id" => incident.id}, %{current_user: incident.creator})

      assert deleted["id"] == incident.id
      refute refetch(incident)
    end
  end

  describe "acceptIncident" do
    test "responders can accept" do
      incident = insert(:incident)
      account = incident.repository.publisher.account
      user = insert(:user, account: account)
      role = insert(:role, account: account, repositories: ["*"], permissions: %{support: true})
      insert(:role_binding, role: role, user: user)

      {:ok, %{data: %{"acceptIncident" => updated}}} = run_query("""
        mutation Update($id: ID!) {
          acceptIncident(id: $id) {
            id
            status
            owner { id }
          }
        }
      """, %{"id" => incident.id}, %{current_user: user})

      assert updated["id"] == incident.id
      assert updated["status"] == "IN_PROGRESS"
      assert updated["owner"]["id"] == user.id
    end
  end

  describe "createMessage" do
    test "it can create a message" do
      incident = insert(:incident)
      user = insert(:user)

      {:ok, %{data: %{"createMessage" => msg}}} = run_query("""
        mutation Create($id: ID!, $attrs: IncidentMessageAttributes!) {
          createMessage(incidentId: $id, attributes: $attrs) {
            id
            text
            incident { id }
            entities { id type user { id } startIndex endIndex text }
          }
        }
      """, %{
        "id" => incident.id,
        "attrs" => %{
          "text" => "created",
          "entities" => [
            %{"type" => "MENTION", "userId" => user.id, "startIndex" => 0, "endIndex" => 1, "text" => user.name}
          ]
        }
      }, %{current_user: incident.creator})

      assert msg["incident"]["id"] == incident.id
      assert msg["text"] == "created"

      [entity] = msg["entities"]
      assert entity["type"] == "MENTION"
      assert entity["user"]["id"] == user.id
      assert entity["startIndex"] == 0
      assert entity["endIndex"] == 1
      assert entity["text"] == user.name
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

  describe "createReaction" do
    test "users can create reactions" do
      msg = insert(:incident_message)

      {:ok, %{data: %{"createReaction" => message}}} = run_query("""
        mutation Create($id: ID!, $name: String!) {
          createReaction(messageId: $id, name: $name) {
            id
            reactions { name }
          }
        }
      """, %{"id" => msg.id, "name" => "smile"}, %{current_user: msg.incident.creator})

      assert message["id"] == msg.id
      assert message["reactions"] == [%{"name" => "smile"}]
    end
  end

  describe "deleteReaction" do
    test "users can create reactions" do
      msg = insert(:incident_message)
      reaction = insert(:reaction, message: msg)

      {:ok, %{data: %{"deleteReaction" => message}}} = run_query("""
        mutation Create($id: ID!, $name: String!) {
          deleteReaction(messageId: $id, name: $name) {
            id
            reactions { name }
          }
        }
      """, %{"id" => msg.id, "name" => "smile"}, %{current_user: reaction.creator})

      assert message["id"] == msg.id
      assert Enum.empty?(message["reactions"])
    end
  end

  describe "followIncident" do
    test "it can create a follower" do
      incident = insert(:incident)

      {:ok, %{data: %{"followIncident" => follow}}} = run_query("""
        mutation Follow($id: ID!, $attrs: FollowerAttributes!) {
          followIncident(id: $id, attributes: $attrs) {
            id
            preferences { message incidentUpdate mention }
          }
        }
      """, %{
        "id" => incident.id,
        "attrs" => %{"preferences" => %{"message" => true, "incidentUpdate" => true, "mention" => true}}
      }, %{current_user: incident.creator})

      assert follow["id"]
      assert follow["preferences"]["message"]
      assert follow["preferences"]["incidentUpdate"]
      assert follow["preferences"]["mention"]
    end
  end

  describe "unfollowIncident" do
    test "it can create a follower" do
      incident = insert(:incident)
      follow = insert(:follower, incident: incident, user: incident.creator)

      {:ok, %{data: %{"unfollowIncident" => del}}} = run_query("""
        mutation Follow($id: ID!) {
          unfollowIncident(id: $id) { id }
        }
      """, %{"id" => incident.id}, %{current_user: incident.creator})

      assert del["id"] == follow.id
    end
  end

  describe "readNotifications" do
    test "it can read notifications for an incident" do
      user = insert(:user)
      incident = insert(:incident)
      notifs = insert_list(2, :notification, user: user, incident: incident)
      ignore = insert(:notification, user: user)

      {:ok, %{data: %{"readNotifications" => 2}}} = run_query("""
        mutation Read($incidentId: ID!) {
          readNotifications(incidentId: $incidentId)
        }
      """, %{"incidentId" => incident.id}, %{current_user: user})

      assert refetch(ignore)
      for notif <- notifs,
        do: refute refetch(notif)
    end
  end
end
