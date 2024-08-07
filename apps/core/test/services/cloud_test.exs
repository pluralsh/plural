defmodule Core.Services.CloudTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.Services.Cloud
  alias Core.PubSub

  describe "#create_instance/2" do
    test "creates a new cloud console instance" do
      account = insert(:account)
      user = admin_user(account)
      cluster = insert(:cloud_cluster)
      cockroach = insert(:cockroach_cluster)
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

      assert instance.name == "plrltest"
      assert instance.cloud == :aws
      assert instance.region == "us-east-1"
      assert instance.size == :small

      assert refetch(cluster).count == 1
      assert refetch(cockroach).count == 1

      assert_receive {:event, %PubSub.ConsoleInstanceCreated{item: ^instance}}
    end
  end

  describe "#update_instance/3" do
    test "managers can update the configuration of a console instance" do
      user = insert(:user)
      sa  = insert(:user, service_account: true)
      insert(:impersonation_policy_binding,
        policy: build(:impersonation_policy, user: sa),
        user: user
      )
      instance = insert(:console_instance, owner: sa)

      {:ok, updated} = Cloud.update_instance(%{size: :large}, instance.id, user)

      assert updated.id == instance.id
      assert updated.size == :large

      assert_receive {:event, %PubSub.ConsoleInstanceUpdated{item: ^updated}}
    end

    test "non-managers can update the configuration of a console instance" do
      user = insert(:user)
      sa  = insert(:user, service_account: true)
      instance = insert(:console_instance, owner: sa)

      {:error, _} = Cloud.update_instance(%{size: :large}, instance.id, user)
    end
  end

  describe "#delete_instance/2" do
    test "managers can update the configuration of a console instance" do
      user = insert(:user)
      sa  = insert(:user, service_account: true)
      insert(:impersonation_policy_binding,
        policy: build(:impersonation_policy, user: sa),
        user: user
      )
      instance = insert(:console_instance, owner: sa)

      {:ok, deleted} = Cloud.delete_instance(instance.id, user)

      assert deleted.id == instance.id
      assert deleted.deleted_at

      assert_receive {:event, %PubSub.ConsoleInstanceDeleted{item: ^deleted}}
    end

    test "non-managers can update the configuration of a console instance" do
      user = insert(:user)
      sa  = insert(:user, service_account: true)
      instance = insert(:console_instance, owner: sa)

      {:error, _} = Cloud.delete_instance(instance.id, user)
    end
  end
end
