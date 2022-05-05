defmodule Core.Services.Shell.DemoTest do
  use Core.SchemaCase, async: false
  use Mimic
  alias GoogleApi.CloudResourceManager.V3.Api.Projects
  alias GoogleApi.CloudResourceManager.V3.Api.Operations
  alias GoogleApi.CloudResourceManager.V3.Model.Operation
  alias GoogleApi.IAM.V1.Api.Projects, as: IAMProjects
  alias GoogleApi.IAM.V1.Model.{ServiceAccountKey, Policy, ServiceAccount}
  alias Core.Services.Shell.Demo

  describe "#create_demo_project/1" do
    test "a user can create a demo project" do
      user = insert(:user)
      expect(Goth.Token, :for_scope, fn _ -> {:ok, %{token: "token"}} end)
      expect(Projects, :cloudresourcemanager_projects_create, fn _, [body: _] ->
        {:ok, %{name: "operations/123"}}
      end)

      {:ok, demo} = Demo.create_demo_project(user)

      assert demo.user_id == user.id
      assert is_binary(demo.project_id)
      assert demo.operation_id == "123"
      refute demo.ready
    end
  end

  describe "#delete_demo_project/1" do
    test "a user can delete demo projects" do
      demo = insert(:demo_project)

      expect(Goth.Token, :for_scope, fn _ -> {:ok, %{token: "token"}} end)
      expect(Projects, :cloudresourcemanager_projects_delete, fn _, _ ->
        {:ok, %{name: "operations/123"}}
      end)

      {:ok, _} = Demo.delete_demo_project(demo)

      refute refetch(demo)
    end
  end

  describe "#poll_demo_project/1" do
    test "if the operation is ready, it will create a service account and creds" do
      demo = insert(:demo_project)

      expect(Goth.Token, :for_scope, 3, fn _ -> {:ok, %{token: "token"}} end)
      expect(Operations, :cloudresourcemanager_operations_get, fn _, _ ->
        {:ok, %Operation{done: true}}
      end)
      expect(IAMProjects, :iam_projects_service_accounts_create, fn _, _, [body: _] ->
        {:ok, %ServiceAccount{email: "email@iam.google.com", uniqueId: "123"}}
      end)
      expect(Projects, :cloudresourcemanager_projects_get_iam_policy, fn _, _ ->
        {:ok, %Policy{bindings: []}}
      end)
      expect(Projects, :cloudresourcemanager_projects_set_iam_policy, fn _, _, [body: _] ->
        {:ok, %Policy{bindings: []}}
      end)
      key = Jason.encode!(%{dummy: "key"}) |> Base.encode64()
      expect(IAMProjects, :iam_projects_service_accounts_keys_create, fn _, _, _ ->
        {:ok, %ServiceAccountKey{privateKeyData: key}}
      end)

      {:ok, polled} = Demo.poll_demo_project(demo)

      assert polled.ready
      {:ok, _} = Poison.decode(polled.credentials)
    end

    test "if the operation is not ready, it'll just echo back the demo project record" do
      demo = insert(:demo_project)

      expect(Goth.Token, :for_scope, fn _ -> {:ok, %{token: "token"}} end)
      expect(Operations, :cloudresourcemanager_operations_get, fn _, _ ->
        {:ok, %Operation{done: false}}
      end)

      {:ok, polled} = Demo.poll_demo_project(demo)

      refute polled.ready
    end
  end

  describe "#poll/1" do
    test "it will fetch a list of projects to delete" do
      expired = Timex.now() |> Timex.shift(hours: -10)
      insert_list(5, :demo_project, inserted_at: expired)
      insert_list(5, :demo_project)

      {:ok, found} = Demo.poll(3)

      assert length(found) == 3

      for demo <- found,
        do: assert demo.heartbeat
    end
  end
end
