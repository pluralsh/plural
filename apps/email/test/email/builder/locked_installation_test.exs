defmodule Email.Builder.LockedInstallationTest do
  use Core.SchemaCase, async: true
  use Bamboo.Test

  describe "#email/1" do
    test "if it's sent to a service account, the recipients will be expanded" do
      service_account = insert(:user, service_account: true)
      user = insert(:user, account: service_account.account)
      %{group: group} = insert(:impersonation_policy_binding,
        policy: build(:impersonation_policy, user: service_account),
        group: insert(:group, account: service_account.account)
      )
      insert(:group_member, group: group, user: user)

      inst = insert(:installation, user: service_account)
      ci = insert(:chart_installation,
        installation: inst,
        version: build(:version, dependencies: %{instructions: %{script: "blach", instructions: nil}})
      )

      %{to: [to]} = Email.Builder.LockedInstallation.email(ci)

      assert to.id == user.id
    end
  end
end
