defmodule Core.Services.Cloud.WorkflowTest do
  use Core.SchemaCase, async: true
  use Mimic
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

      expect(Core.Services.Cloud.Poller, :repository, fn -> {:ok, "some-id"} end)
      expect(Req, :post, fn _, [graphql: {_, %{clusterId: ^cluster_id}}] ->
        {:ok, %Req.Response{status: 200, body: %{"data" => %{"createServiceDeployment" => %{"id" => Ecto.UUID.generate()}}}}}
      end)

      {:ok, %{external_id: svc_id} = instance} = Workflow.provision(instance)

      assert instance.status == :provisioned
      assert instance.instance_status.db
      assert instance.instance_status.svc

      expect(Req, :post, fn _, [graphql: {_, %{id: ^svc_id}}] ->
        {:ok, %Req.Response{status: 200, body: %{"data" => %{"deleteServiceDeployment" => %{"id" => svc_id}}}}}
      end)

      {:ok, instance} = Workflow.deprovision(instance)

      refute instance.instance_status.db
      refute instance.instance_status.svc
      refute refetch(instance)

      assert refetch(roach).count == 0
      assert refetch(cluster).count == 0
    end
  end
end
