defmodule Email.Deliverable.VersionsTest do
  use Core.SchemaCase, async: true
  use Bamboo.Test

  alias Core.PubSub
  alias Email.PubSub.Consumer

  describe "InstallationLocked" do
    test "it can send reset emails" do
      ci = insert(:chart_installation,
        version: build(:version,
          dependencies: %{instructions: %{script: "blach", instructions: nil}}
        )
      )

      event = %PubSub.InstallationLocked{item: ci}
      Consumer.handle_event(event)

      assert_delivered_email Email.Builder.LockedInstallation.email(ci)
    end
  end

  describe "DeferredUpdateCreated" do
    test "it can send promotion emails for pending updates" do
      ci_inst = insert(:chart_installation)
      ci = insert(:deferred_update, pending: true, chart_installation: ci_inst, version: ci_inst.version)

      event = %PubSub.DeferredUpdateCreated{item: ci}
      {:ok, _} = Consumer.handle_event(event)

      assert_delivered_email Email.Builder.PendingPromotion.email(ci)
    end

    test "it ignores for non pending updates" do
      ci = insert(:deferred_update, pending: false)

      event = %PubSub.DeferredUpdateCreated{item: ci}
      :ok = Consumer.handle_event(event)
    end
  end
end
