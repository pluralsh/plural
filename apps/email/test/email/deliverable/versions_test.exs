defmodule Email.Deliverable.VersionsTest do
  use Core.SchemaCase, async: true
  use Bamboo.Test

  alias Core.PubSub
  alias Email.PubSub.Consumer

  describe "InstallationLocked" do
    test "it can send lock emails" do
      ci = insert(:chart_installation,
        version: build(:version,
          dependencies: %{instructions: %{script: "blach", instructions: nil}}
        )
      )
      insert(:cluster, owner: ci.installation.user)

      event = %PubSub.InstallationLocked{item: ci}
      {:ok, _} = Consumer.handle_event(event)

      assert_delivered_email Email.Builder.LockedInstallation.email(ci)
    end

    test "it will ignore if there is no cluster" do
      ci = insert(:chart_installation,
        version: build(:version,
          dependencies: %{instructions: %{script: "blach", instructions: nil}}
        )
      )

      event = %PubSub.InstallationLocked{item: ci}
      :ok = Consumer.handle_event(event)
    end
  end

  describe "DeferredUpdateCreated" do
    test "it can send promotion emails for pending updates" do
      ci_inst = insert(:chart_installation)
      ci = insert(:deferred_update, pending: true, chart_installation: ci_inst, version: ci_inst.version)
      insert(:cluster, owner: ci.user)

      event = %PubSub.DeferredUpdateCreated{item: ci}
      {:ok, _} = Consumer.handle_event(event)

      assert_delivered_email Email.Builder.PendingPromotion.email(ci)
    end

    test "it will ignore if the user no longer has a cluster" do
      ci_inst = insert(:chart_installation)
      ci = insert(:deferred_update, pending: true, chart_installation: ci_inst, version: ci_inst.version)

      event = %PubSub.DeferredUpdateCreated{item: ci}
      :ok = Consumer.handle_event(event)
    end

    test "it ignores for non pending updates" do
      ci = insert(:deferred_update, pending: false)
      insert(:cluster, owner: ci.user)

      event = %PubSub.DeferredUpdateCreated{item: ci}
      :ok = Consumer.handle_event(event)
    end
  end
end
