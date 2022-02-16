defmodule Email.Deliverable.VersionsTest do
  use Core.SchemaCase, async: true
  use Bamboo.Test

  alias Core.PubSub
  alias Email.PubSub.Consumer

  describe "InstallationLocked" do
    test "it can send reset emails" do
      ci = insert(:chart_installation,
        version: build(:version,
          dependencies: %{instructions: %{script: "blach", instructions: nil}},
        )
      )

      event = %PubSub.InstallationLocked{item: ci}
      Consumer.handle_event(event)

      assert_delivered_email Email.Builder.LockedInstallation.email(ci)
    end
  end
end
