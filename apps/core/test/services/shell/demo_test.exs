defmodule Core.Services.Shell.DemoTest do
  use Core.SchemaCase, async: false
  use Mimic
  alias GoogleApi.CloudResourceManager.V3.Api.Projects
  alias GoogleApi.CloudResourceManager.V3.Api.Operations
  alias GoogleApi.CloudResourceManager.V3.Model.Operation
  alias GoogleApi.CloudBilling.V1.Api.Projects, as: BillingProjects
  alias GoogleApi.CloudBilling.V1.Model.ProjectBillingInfo
  alias GoogleApi.IAM.V1.Api.Projects, as: IAMProjects
  alias GoogleApi.IAM.V1.Model.{ServiceAccountKey, Policy, ServiceAccount}
  alias GoogleApi.CloudBilling.V1.Api.BillingAccounts
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
      assert demo.state == :created

      assert refetch(user).demo_count == 1
      refute demo.ready
    end

    test "users that have already created demoes cannot create" do
      user = insert(:user, demo_count: 3)

      {:error, _} = Demo.create_demo_project(user)
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

    test "if a user has at most 1 upgrade queue (eg for their demo cluster) we will reset their demo installations" do
      demo = insert(:demo_project)
      inst = insert(:installation, user: demo.user)
      insert(:upgrade_queue, user: demo.user)

      expect(Goth.Token, :for_scope, fn _ -> {:ok, %{token: "token"}} end)
      expect(Projects, :cloudresourcemanager_projects_delete, fn _, _ ->
        {:ok, %{name: "operations/123"}}
      end)

      {:ok, _} = Demo.delete_demo_project(demo)

      refute refetch(inst)
    end

    test "if a user has 2 or more upgrade queues, we will not reset installations" do
      demo = insert(:demo_project)
      inst = insert(:installation, user: demo.user)
      insert(:upgrade_queue, user: demo.user)
      insert(:upgrade_queue, user: demo.user)

      expect(Goth.Token, :for_scope, fn _ -> {:ok, %{token: "token"}} end)
      expect(Projects, :cloudresourcemanager_projects_delete, fn _, _ ->
        {:ok, %{name: "operations/123"}}
      end)

      {:ok, _} = Demo.delete_demo_project(demo)

      assert refetch(inst)
    end
  end

  describe "#poll_demo_project/1" do
    test "if the operation is ready, it will create a service account and creds" do
      demo = insert(:demo_project)

      expect(Goth.Token, :for_scope, 5, fn _ -> {:ok, %{token: "token"}} end)
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
      expect(IAMProjects, :iam_projects_service_accounts_get, fn _, _, "plural@" <> _ -> {:error, :not_found} end)
      expect(IAMProjects, :iam_projects_service_accounts_keys_create, fn _, _, _ ->
        {:ok, %ServiceAccountKey{privateKeyData: key}}
      end)

      expect(BillingProjects, :cloudbilling_projects_get_billing_info, fn _, _ -> {:ok, %ProjectBillingInfo{}} end)
      expect(BillingAccounts, :cloudbilling_billing_accounts_list, fn _ ->
        {:ok, %{billingAccounts: [%{name: "billingAccounts/1342"}]}}
      end)
      expect(BillingProjects, :cloudbilling_projects_update_billing_info, fn
        _, _, [body: %ProjectBillingInfo{billingAccountName: "billingAccounts/1342", billingEnabled: true}] ->
          {:ok, %ProjectBillingInfo{}}
      end)
      expect(GoogleApi.ServiceUsage.V1.Api.Services, :serviceusage_services_batch_enable, fn _, _, [body: _] -> {:ok, %{
        name: "operations/1234"
      }} end)

      {:ok, polled} = Demo.poll_demo_project(demo)

      assert polled.ready
      assert polled.state == :ready
      assert polled.enabled_op_id == "1234"

      {:ok, _} = Poison.decode(polled.credentials)
    end

    test "if the demo project is ready, then it will query the services enabled op" do
      demo = insert(:demo_project, state: :ready, enabled_op_id: "1234")
      expect(Goth.Token, :for_scope, fn _ -> {:ok, %{token: "token"}} end)
      expect(GoogleApi.ServiceUsage.V1.Api.Operations, :serviceusage_operations_get, fn _, "1234"-> {:ok, %{done: true}} end)

      {:ok, polled} = Demo.poll_demo_project(demo)

      assert polled.state == :enabled
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

  describe "#transfer_demo_project/2" do
    test "it will transfer a users demo project" do
      demo = insert(:demo_project)
      shell = insert(:cloud_shell, demo: demo, user: demo.user)

      proj_id = demo.project_id
      expect(Goth.Token, :for_scope, fn _ -> {:ok, %{token: "token"}} end)
      expect(Projects, :cloudresourcemanager_projects_move, fn _, ^proj_id, [body: %{destinationParent: "organizations/org-id"}] ->
        {:ok, %{}}
      end)

      {:ok, res} = Demo.transfer_demo_project("org-id", demo.user)

      assert res.id == demo.id

      refute refetch(demo)
      refute refetch(shell).demo_id
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
