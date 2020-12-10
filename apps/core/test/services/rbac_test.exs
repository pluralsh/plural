defmodule Core.Services.RbacTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Rbac

  describe "#validate/2" do
    test "it can validate user bindings" do
      user = insert(:user)
      role = insert(:role, repositories: ["repo"], permissions: %{install: true})
      insert(:role_binding, role: role, user: user)

      assert Rbac.validate(user, :install, repository: "repo")
    end

    test "it can validate group bindings" do
      user = insert(:user)
      role = insert(:role, repositories: ["repo"], permissions: %{install: true})
      %{group: group} = insert(:group_member, user: user)
      insert(:role_binding, role: role, group: group)

      assert Rbac.validate(user, :install, repository: "repo")
    end

    test "it can validate with wildcards" do
      user = insert(:user)
      role = insert(:role, repositories: ["*", "other-repo"], permissions: %{install: true})
      %{group: group} = insert(:group_member, user: user)
      insert(:role_binding, role: role, group: group)

      assert Rbac.validate(user, :install, repository: "repo")
    end

    test "it will fail if no role matches" do
      user = insert(:user)
      role = insert(:role, repositories: ["*", "other-repo"], permissions: %{publish: true})
      %{group: group} = insert(:group_member, user: user)
      insert(:role_binding, role: role, group: group)

      role = insert(:role, repositories: ["other-repo"], permissions: %{install: true})
      insert(:role_binding, role: role, user: user)

      refute Rbac.validate(user, :install, repository: "repo")
    end

    test "it can filter on account" do
      account = insert(:account)
      user = insert(:user)
      role = insert(:role, repositories: ["*", "other-repo"], account: account, permissions: %{publish: true})
      %{group: group} = insert(:group_member, user: user)
      insert(:role_binding, role: role, group: group)

      role = insert(:role, repositories: ["repo"], permissions: %{install: true})
      insert(:role_binding, role: role, user: user)

      refute Rbac.validate(user, :install, repository: "repo", account: account)
    end
  end
end