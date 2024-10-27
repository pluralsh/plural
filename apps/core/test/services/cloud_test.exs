defmodule Core.Services.CloudTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.Services.Cloud
  alias Core.PubSub

  describe "#create_instance/2" do
    test "creates a new cloud console instance" do
      account = insert(:account)
      enable_features(account, [:cd])
      user = admin_user(account)
      cluster = insert(:cloud_cluster)
      postgres = insert(:postgres_cluster)
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
      assert refetch(postgres).count == 1

      sa = Core.Services.Users.get_user_by_email("plrltest-cloud-sa@srv.plural.sh")
      %{impersonation_policy: %{bindings: [binding]}} = Core.Repo.preload(sa, [impersonation_policy: :bindings])
      assert binding.user_id == user.id

      assert_receive {:event, %PubSub.ConsoleInstanceCreated{item: ^instance}}
    end

    test "enterprise accounts can create dedicated console instances" do
      account = insert(:account)
      enterprise_plan(account)
      user = admin_user(account)
      insert(:repository, name: "console")

      expect(HTTPoison, :post, fn _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{client_id: "123", client_secret: "secret"})}}
      end)

      {:ok, instance} = Cloud.create_instance(%{
        type: :dedicated,
        name: "plrltest",
        cloud: :aws,
        region: "us-east-1",
        size: :small
      }, user)

      assert instance.name == "plrltest"
      assert instance.cloud == :aws
      assert instance.region == "us-east-1"
      assert instance.size == :small
      refute instance.postgres_id
      refute instance.cluster_id

      sa = Core.Services.Users.get_user_by_email("plrltest-cloud-sa@srv.plural.sh")
      %{impersonation_policy: %{bindings: [binding]}} = Core.Repo.preload(sa, [impersonation_policy: :bindings])
      assert binding.user_id == user.id

      assert_receive {:event, %PubSub.ConsoleInstanceCreated{item: ^instance}}
    end

    test "cannot create instances w/ capitalized names" do
      account = insert(:account)
      enterprise_plan(account)
      user = admin_user(account)
      insert(:repository, name: "console")

      {:error, _} = Cloud.create_instance(%{
        type: :dedicated,
        name: "My-Cluster",
        cloud: :aws,
        region: "us-east-1",
        size: :small
      }, user)
    end

    test "nonenterprise plans cannot create a dedicated cloud console instance" do
      account = insert(:account)
      enable_features(account, [:cd])
      user = admin_user(account)
      insert(:cloud_cluster)
      insert(:postgres_cluster)
      insert(:repository, name: "console")

      {:error, err} = Cloud.create_instance(%{
        type: :dedicated,
        name: "plrltest",
        cloud: :aws,
        region: "us-east-1",
        size: :small
      }, user)

      assert err =~ "enterprise"
    end

    test "unpaid users cannot create instances" do
      account = insert(:account)
      user = admin_user(account)
      insert(:cloud_cluster)
      insert(:postgres_cluster)
      insert(:repository, name: "console")

      {:error, "you must be on a paid plan to use Plural Cloud"} = Cloud.create_instance(%{
        name: "plrltest",
        cloud: :aws,
        region: "us-east-1",
        size: :small
      }, user)
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

  describe "#reap/1" do
    test "it will send a first warning" do
      inst = insert(:console_instance)

      {:ok, reaped} = Cloud.reap(inst)

      assert reaped.first_notif_at

      assert_receive {:event, %PubSub.ConsoleInstanceReaped{item: ^reaped}}
    end

    test "it will send a second warning" do
      inst = insert(:console_instance, first_notif_at: Timex.now())

      {:ok, reaped} = Cloud.reap(inst)

      assert reaped.second_notif_at

      assert_receive {:event, %PubSub.ConsoleInstanceReaped{item: ^reaped}}
    end

    test "it will finally delete" do
      inst = insert(:console_instance,
        first_notif_at: Timex.now(),
        second_notif_at: Timex.now()
      )

      {:ok, reaped} = Cloud.reap(inst)

      assert reaped.deleted_at

      assert_receive {:event, %PubSub.ConsoleInstanceDeleted{item: ^reaped}}
    end
  end
end
