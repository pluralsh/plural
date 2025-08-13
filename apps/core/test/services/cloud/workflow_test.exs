defmodule Core.Services.Cloud.WorkflowTest do
  use Core.SchemaCase, async: false
  use Mimic
  alias Core.Clients.Console
  alias Core.Services.{Cloud, Cloud.Workflow}

  describe "up and down" do
    test "it will consistently provision a cloud console's infrastructure" do
      account = insert(:account)
      enable_features(account, [:cd])
      user = admin_user(account)
      %{external_id: cluster_id} = cluster = insert(:cloud_cluster)
      roach = insert(:postgres_cluster)
      insert(:repository, name: "console")

      expect(HTTPoison, :post, fn _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{client_id: "123", client_secret: "secret"})}}
      end)

      {:ok, instance} = Cloud.create_instance(%{
        name: "plrltest",
        cloud: :aws,
        region: "us-east-1",
        size: :small
      }, user)

      svc_id = Ecto.UUID.generate()
      expect(Core.Services.Cloud.Poller, :repository, fn -> {:ok, "some-id"} end)
      expect(Req, :post, fn _, [graphql: {_, %{clusterId: ^cluster_id}}] ->
          {:ok, %Req.Response{status: 200, body: %{"data" => %{"createServiceDeployment" => %{"id" => svc_id}}}}}
      end)

      expect(Req, :post, fn _, [graphql: {_, %{id: ^svc_id}}] ->
          {:ok, %Req.Response{status: 200, body: %{"data" => %{"serviceDeployment" => %{"id" => svc_id, "status" => "HEALTHY"}}}}}
      end)

      {:ok, %{external_id: svc_id} = instance} = Workflow.provision(instance)

      assert instance.status == :provisioned
      assert instance.instance_status.svc

      expect(Req, :post, fn _, [graphql: {_, %{id: ^svc_id}}] ->
        {:ok, %Req.Response{status: 200, body: %{"data" => %{"deleteServiceDeployment" => %{"id" => svc_id}}}}}
      end)

      {:ok, instance} = Workflow.deprovision(instance)

      refute instance.instance_status.svc
      refute refetch(instance)

      assert refetch(roach).count == 0
      assert refetch(cluster).count == 0
    end

    test "it can handle setup and teardown of a dedicated cloud instance" do
      account = insert(:account)
      enterprise_plan(account)
      user = admin_user(account)
      insert(:repository, name: "console")

      expect(HTTPoison, :post, fn _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{client_id: "123", client_secret: "secret"})}}
      end)

      {:ok, instance} = Cloud.create_instance(%{
        name: "plrltest",
        cloud: :aws,
        region: "us-east-1",
        size: :small,
        type: :dedicated
      }, user)

      expect(Core.Services.Cloud.Poller, :repository, fn -> {:ok, "repo-id"} end)
      expect(Core.Services.Cloud.Poller, :project, fn -> {:ok, "proj-id"} end)
      stack_id = Ecto.UUID.generate()
      stack_q = Console.queries(:stack_q)
      me_q = Console.queries(:me_q)
      expect(Req, :post, 3, fn
        _, [graphql: {^me_q, _}] -> {:ok, %Req.Response{status: 200, body: %{"data" => %{"me" => %{"id" => "me-id"}}}}}
        _, [graphql: {_, %{attributes: attrs}}] ->
          send self(), {:attributes, attrs}
          {:ok, %Req.Response{status: 200, body: %{"data" => %{"createStack" => %{"id" => stack_id}}}}}
        _, [graphql: {^stack_q, %{id: ^stack_id}}] ->
          {:ok, %Req.Response{
            status: 200,
            body: %{"data" => %{"infrastructureStack" => %{"id" => stack_id, "status" => "SUCCESSFUL"}}}
          }}
      end)

      {:ok, %{external_id: stack_id} = instance} = Workflow.provision(instance)

      assert instance.status == :provisioned
      assert instance.instance_status.stack

      assert_receive {:attributes, attrs}

      assert attrs.project_id == "proj-id"
      assert attrs.actor_id == "me-id"
      assert attrs.repository_id == "repo-id"
      assert attrs.git.ref == "main"
      assert attrs.git.folder == "terraform/modules/dedicated/aws"
      refute Enum.empty?(attrs.environment)

      del_q = Console.queries(:stack_delete)
      expect(Req, :post, fn _, [graphql: {^del_q, %{id: ^stack_id}}] ->
        {:ok, %Req.Response{status: 200, body: %{"data" => %{"deleteStack" => %{"id" => stack_id}}}}}
      end)

      {:ok, instance} = Workflow.deprovision(instance)

      refute refetch(instance)
    end
  end
end
