defmodule Core.PubSub.Audits.RepositoriesTest do
  use Core.SchemaCase, async: true
  alias Core.PubSub
  alias Core.PubSub.Consumers.Audits

  describe "RepositoryCreated" do
    test "it can post a message about the meeting" do
      repository = insert(:repository)
      actor = insert(:user)

      event = %PubSub.RepositoryCreated{item: repository, actor: actor}
      {:ok, audit} = Audits.handle_event(event)

      assert audit.action == "repository:created"
      assert audit.repository_id == repository.id
      assert audit.actor_id == actor.id
      assert audit.account_id == actor.account_id
    end
  end

  describe "RepositoryUpdated" do
    test "it can post a message about the meeting" do
      repository = insert(:repository)
      actor = insert(:user)

      event = %PubSub.RepositoryUpdated{item: repository, actor: actor}
      {:ok, audit} = Audits.handle_event(event)

      assert audit.action == "repository:updated"
      assert audit.repository_id == repository.id
      assert audit.actor_id == actor.id
      assert audit.account_id == actor.account_id
    end
  end

  describe "InstallationCreated" do
    test "it can post a message about the meeting" do
      installation = insert(:installation)
      actor = insert(:user)

      event = %PubSub.InstallationCreated{item: installation, actor: actor}
      {:ok, audit} = Audits.handle_event(event)

      assert audit.action == "repository:installation:created"
      assert audit.repository_id == installation.repository_id
      assert audit.actor_id == actor.id
      assert audit.account_id == actor.account_id
    end
  end

  describe "InstallationUpdated" do
    test "it can post a message about the meeting" do
      installation = insert(:installation)
      actor = insert(:user)

      event = %PubSub.InstallationUpdated{item: installation, actor: actor}
      {:ok, audit} = Audits.handle_event(event)

      assert audit.action == "repository:installation:updated"
      assert audit.repository_id == installation.repository_id
      assert audit.actor_id == actor.id
      assert audit.account_id == actor.account_id
    end
  end

  describe "InstallationDeleted" do
    test "it can post a message about the meeting" do
      installation = insert(:installation)
      actor = insert(:user)

      event = %PubSub.InstallationDeleted{item: installation, actor: actor}
      {:ok, audit} = Audits.handle_event(event)

      assert audit.action == "repository:installation:deleted"
      assert audit.repository_id == installation.repository_id
      assert audit.actor_id == actor.id
      assert audit.account_id == actor.account_id
    end
  end

  describe "DockerImageCreated" do
    test "it can post a message about the meeting" do
      dkr   = insert(:docker_image)
      actor = insert(:user)

      event = %PubSub.DockerImageCreated{item: dkr, actor: actor}
      {:ok, audit} = Audits.handle_event(event)

      assert audit.action == "dkr:pushed"
      assert audit.image_id == dkr.id
      assert audit.actor_id == actor.id
      assert audit.account_id == actor.account_id
    end
  end
end
