defmodule Core.Services.IncidentsTest do
  use Core.SchemaCase
  alias Core.Services.Incidents

  describe "#create_incident" do
    test "repository installers can create incidents" do
      user = insert(:user)
      repository = insert(:repository)
      insert(:installation, repository: repository, user: user)

      {:ok, incident} = Incidents.create_incident(%{
        title: "wtf",
        description: "something went wrong",
        severity: 3
      }, repository.id, user)

      assert incident.repository_id == repository.id
      assert incident.creator_id == user.id
      assert incident.status == :open
      assert incident.title == "wtf"
    end

    test "non-installers cannot create incidents" do
      user = insert(:user)
      repository = insert(:repository)

      {:error, _} = Incidents.create_incident(%{
        title: "wtf",
        description: "something went wrong",
        severity: 3
      }, repository.id, user)
    end
  end

  describe "#update_incident/3" do
    test "Incident creators can update" do
      incident = insert(:incident)

      {:ok, updated} = Incidents.update_incident(%{severity: 0}, incident.id, incident.creator)

      assert updated.severity == 0
    end

    test "incident owners can update" do
      user = insert(:user)
      incident = insert(:incident, owner: user)

      {:ok, updated} = Incidents.update_incident(%{severity: 0}, incident.id, incident.creator)

      assert updated.severity == 0
    end

    test "non-owner/creators cannot update" do
      user = insert(:user)
      incident = insert(:incident)

      {:error, _} = Incidents.update_incident(%{severity: 0}, incident.id, user)
    end
  end

  describe "#accept_incident/2" do
    test "account users can accept incidents" do
      account = insert(:account)
      user = insert(:user, account: account)

      role = insert(:role, account: account, repositories: ["*"], permissions: %{support: true})
      insert(:role_binding, role: role, user: user)

      incident = insert(:incident, repository: build(:repository, publisher: build(:publisher, account: account)))

      {:ok, accepted} = Incidents.accept_incident(incident.id, user)

      assert accepted.owner_id == user.id
    end

    test "non-account operators cannot accept" do
      user = insert(:user)
      incident = insert(:incident)

      {:error, _} = Incidents.accept_incident(incident.id, user)
    end
  end

  describe "#create_message/3" do
    test "members on the creator's account can message" do
      incident = insert(:incident)
      user = insert(:user, account: incident.creator.account)

      {:ok, msg} = Incidents.create_message(%{text: "hey"}, incident.id, user)

      assert msg.creator_id == user.id
      assert msg.incident_id == incident.id
      assert msg.text == "hey"
    end

    test "members on the owner's account can message" do
      incident = insert(:incident, owner: insert(:user))
      user = insert(:user, account: incident.owner.account)

      {:ok, msg} = Incidents.create_message(%{text: "hey"}, incident.id, user)

      assert msg.creator_id == user.id
      assert msg.incident_id == incident.id
      assert msg.text == "hey"
    end

    test "users unaffiliated with the incident cannot message" do
      incident = insert(:incident, owner: insert(:user))
      user = insert(:user)

      {:error, _} = Incidents.create_message(%{text: "hey"}, incident.id, user)
    end
  end

  describe "#update_message/3" do
    test "message creators can update" do
      msg = insert(:incident_message)

      {:ok, updated} = Incidents.update_message(%{text: "updated"}, msg.id, msg.creator)

      assert updated.id == msg.id
      assert updated.text == "updated"
    end

    test "non-creators cannot update" do
      msg = insert(:incident_message)

      {:error, _} = Incidents.update_message(%{text: "updated"}, msg.id, insert(:user))
    end
  end

  describe "#delete_message/3" do
    test "message creators can update" do
      msg = insert(:incident_message)

      {:ok, deleted} = Incidents.delete_message(msg.id, msg.creator)

      refute refetch(deleted)
    end

    test "non-creators cannot update" do
      msg = insert(:incident_message)

      {:error, _} = Incidents.delete_message(msg.id, insert(:user))
    end
  end
end
