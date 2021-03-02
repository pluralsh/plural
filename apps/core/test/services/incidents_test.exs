defmodule Core.Services.IncidentsTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Incidents
  alias Core.PubSub

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

      %{history: [hist]} = Core.Repo.preload(incident, [:history])

      assert hist.actor_id == user.id
      assert hist.action == :create

      assert_receive {:event, %PubSub.IncidentCreated{item: ^incident}}
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

      assert_receive {:event, %PubSub.IncidentUpdated{item: ^updated}}
    end

    test "incident owners can update" do
      user = insert(:user)
      incident = insert(:incident, owner: user)

      {:ok, updated} = Incidents.update_incident(%{severity: 0}, incident.id, incident.creator)

      assert updated.severity == 0
    end

    test "it will record severity changes" do
      user = insert(:user)
      incident = insert(:incident, owner: user)

      {:ok, updated} = Incidents.update_incident(%{severity: 0}, incident.id, incident.creator)

      %{history: [hist]} = Core.Repo.preload(updated, [:history])

      assert hist.incident_id == incident.id
      assert hist.action == :severity
    end

    test "it will record status changes" do
      user = insert(:user)
      incident = insert(:incident, owner: user)

      {:ok, updated} = Incidents.update_incident(%{status: :in_progress}, incident.id, incident.creator)

      %{history: [hist]} = Core.Repo.preload(updated, [:history])

      assert hist.incident_id == incident.id
      assert hist.action == :status
    end

    test "it will not choke on tags changes" do
      user = insert(:user)
      incident = insert(:incident, owner: user)

      {:ok, updated} = Incidents.update_incident(%{tags: [%{tag: "test"}]}, incident.id, incident.creator)

      %{history: [hist]} = Core.Repo.preload(updated, [:history])

      assert hist.incident_id == incident.id

      {:ok, updated} = Incidents.update_incident(%{tags: [%{tag: "test"}, %{tag: "another"}]}, incident.id, incident.creator)

      %{history: history} = Core.Repo.preload(updated, [:history, :tags])

      assert Enum.all?(history, & &1.incident_id == incident.id)
      assert length(history) == 2
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

      assert_receive {:event, %PubSub.IncidentUpdated{item: ^accepted}}
    end

    test "non-account operators cannot accept" do
      user = insert(:user)
      incident = insert(:incident)

      {:error, _} = Incidents.accept_incident(incident.id, user)
    end
  end

  describe "#complete_incident/3" do
    test "account users can complete incidents" do
      account = insert(:account)
      user = insert(:user, account: account)

      role = insert(:role, account: account, repositories: ["*"], permissions: %{support: true})
      insert(:role_binding, role: role, user: user)

      incident = insert(:incident, status: :resolved, repository: build(:repository, publisher: build(:publisher, account: account)))

      user = Core.Services.Rbac.preload(user)
      {:ok, completed} = Incidents.complete_incident(%{content: "a postmortem writeup"}, incident.id, user)

      assert completed.status == :complete
      %{postmortem: post} = Core.Repo.preload(completed, [:postmortem])
      assert post.incident_id == completed.id
      assert post.content == "a postmortem writeup"
      assert post.creator_id == user.id

      assert_receive {:event, %PubSub.IncidentUpdated{item: ^completed}}
    end

    test "unresolved incidents cannot be completed" do
      account = insert(:account)
      user = insert(:user, account: account)

      role = insert(:role, account: account, repositories: ["*"], permissions: %{support: true})
      insert(:role_binding, role: role, user: user)

      incident = insert(:incident, repository: build(:repository, publisher: build(:publisher, account: account)))

      {:error, _} = Incidents.complete_incident(%{content: "a postmortem writeup"}, incident.id, user)
    end

    test "non-account operators cannot accept" do
      user = insert(:user)
      incident = insert(:incident)

      {:error, _} = Incidents.accept_incident(incident.id, user)
    end
  end

  describe "#follow_incident/3" do
    test "users on an affected account can follow" do
      incident = insert(:incident)
      user = insert(:user, account: incident.creator.account)

      {:ok, follow} = Incidents.follow_incident(%{preferences: %{message: true}}, incident.id, user)

      assert follow.user_id == user.id
      assert follow.incident_id == incident.id
      assert follow.preferences.message
    end

    test "unaffiliated users cannot follow" do
      incident = insert(:incident)
      user = insert(:user)

      {:error, _} = Incidents.follow_incident(%{preferences: %{message: true}}, incident.id, user)
    end
  end

  describe "#unfollow_incident/2" do
    test "users can remove their follows" do
      follow = insert(:follower)

      {:ok, deleted} = Incidents.unfollow_incident(follow.incident_id, follow.user)

      assert deleted.id == follow.id
      refute refetch(follow)
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

      assert_receive {:event, %PubSub.IncidentMessageCreated{item: ^msg}}
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

      assert_receive {:event, %PubSub.IncidentMessageUpdated{item: ^updated}}
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

      assert_receive {:event, %PubSub.IncidentMessageDeleted{item: ^deleted}}
    end

    test "non-creators cannot update" do
      msg = insert(:incident_message)

      {:error, _} = Incidents.delete_message(msg.id, insert(:user))
    end
  end

  describe "#create_reaction/3" do
    test "members on the owner's account can react" do
      incident = insert(:incident, owner: insert(:user))
      user = insert(:user, account: incident.owner.account)
      msg = insert(:incident_message, incident: incident)

      {:ok, react} = Incidents.create_reaction(msg.id, "smile", user)

      assert msg.id == react.id
    end

    test "random users cannot react" do
      incident = insert(:incident, owner: insert(:user))
      msg = insert(:incident_message, incident: incident)

      {:error, _} = Incidents.create_reaction(msg.id, "smile", insert(:user))
    end
  end

  describe "#delete_reaction/3" do
    test "users can delete their reactions" do
      incident = insert(:incident, owner: insert(:user))
      user = insert(:user, account: incident.owner.account)
      msg = insert(:incident_message, incident: incident)
      insert(:reaction, message: msg, creator: user, name: "smile")

      {:ok, react} = Incidents.delete_reaction(msg.id, "smile", user)

      assert msg.id == react.id
    end
  end
end
