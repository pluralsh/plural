defmodule Core.Services.DnsTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.Services.Dns
  alias Cloudflare.DnsRecord

  describe "#create_domain/2" do
    test "users can create a domain for an account" do
      user = insert(:user)

      {:ok, domain} = Dns.create_domain(%{name: "some.onplural.sh"}, user)

      assert domain.creator_id == user.id
      assert domain.account_id == user.account_id
      assert domain.name == "some.onplural.sh"
    end

    test "it cannot double-create domain names" do
      user = insert(:user)
      domain = insert(:dns_domain, creator: user, account: user.account)

      {:error, _} = Dns.create_domain(%{name: domain.name}, user)
    end

    test "it must be rooted by the onplural domain" do
      user = insert(:user)

      {:error, _} = Dns.create_domain(%{name: "some.wrong.domain"}, user)
    end

    test "it cannot create a nested onplural domain" do
      user = insert(:user)

      {:error, _} = Dns.create_domain(%{name: "some.wrong.onplural.sh"}, user)
    end
  end

  describe "#update_domain/3" do
    test "A domain creator can update his domains' access policies" do
      domain = insert(:dns_domain)
      other_user = insert(:user, account: domain.account)

      {:ok, updated} = Dns.update_domain(%{
        access_policy: %{bindings: [%{user_id: other_user.id}]}
      }, domain.id, domain.creator)

      assert updated.id == domain.id
      [binding] = updated.access_policy.bindings

      assert binding.user_id == other_user.id
    end

    test "you cannot bind to users in other accounts" do
      domain = insert(:dns_domain)
      other_user = insert(:user)

      {:error, _} = Dns.update_domain(%{
        access_policy: %{bindings: [%{user_id: other_user.id}]}
      }, domain.id, domain.creator)
    end

    test "Non-creators cannot update" do
      domain = insert(:dns_domain)
      other_user = insert(:user)

      {:error, _} = Dns.update_domain(%{
        access_policy: %{bindings: [%{user_id: other_user.id}]}
      }, domain.id, insert(:user, account: domain.creator.account))
    end

    test "you can't simply add yourself to the policy" do
      domain = insert(:dns_domain)
      other_user = insert(:user)

      {:error, _} = Dns.update_domain(%{
        access_policy: %{bindings: [%{user_id: other_user.id}]}
      }, domain.id, other_user)
    end
  end

  describe "#delete_domain/3" do
    test "A domain creator can delete his domain if empty" do
      domain = insert(:dns_domain)

      {:ok, _} = Dns.delete_domain(domain.id, domain.creator)

      refute refetch(domain)
    end

    test "nonempty domains cannot be deleted" do
      domain = insert(:dns_domain)
      insert(:dns_record, domain: domain)

      {:error, "domain is not empty"} = Dns.delete_domain(domain.id, domain.creator)
    end

    test "Non-creators cannot delete" do
      domain = insert(:dns_domain)
      {:error, _} = Dns.delete_domain(domain.id, insert(:user, account: domain.creator.account))
    end
  end

  describe "#provision_domain/3" do
    test "if the domain doesn't exist it will create" do
      user = insert(:user)

      {:ok, domain} = Dns.provision_domain("some.onplural.sh", user)

      assert domain.creator_id == user.id
      assert domain.account_id == user.account_id
    end

    test "if the domain does exist it will verify the user has access" do
      creator = insert(:user)
      domain = insert(:dns_domain, account: creator.account)

      {:ok, updated} = Dns.provision_domain(domain.name, creator)

      assert updated.id == domain.id
    end
  end

  describe "#create_record/4" do
    test "a user can create a record for their accounts domain" do
      user = insert(:user)
      domain = insert(:dns_domain, account: user.account)
      external_id = "12345"
      expect(DnsRecord, :create, fn _, _ -> dns_resp(external_id) end)

      {:ok, record} = Dns.create_record(%{
        type: :a,
        name: "some.#{domain.name}",
        records: ["1.2.3.4"],
      }, "cluster", :aws, user)

      assert record.creator_id == user.id
      assert record.cluster == "cluster"
      assert record.provider == :aws
      assert record.external_id == "12345"
      assert record.name == "some.#{domain.name}"
      assert record.type == :a
    end

    test "It will respect access policies" do
      user = insert(:user)
      domain = insert(:dns_domain, account: user.account)
      insert(:dns_access_policy_binding,
        policy: build(:dns_access_policy, domain: domain),
        user: user
      )

      external_id = "12345"
      expect(DnsRecord, :create, fn _, _ -> dns_resp(external_id) end)

      {:ok, record} = Dns.create_record(%{
        type: :a,
        name: "some.#{domain.name}",
        records: ["1.2.3.4"],
      }, "cluster", :aws, user)

      assert record.creator_id == user.id
      assert record.cluster == "cluster"
      assert record.provider == :aws
      assert record.external_id == "12345"
      assert record.name == "some.#{domain.name}"
      assert record.type == :a

      other_user = insert(:user, account: user.account)
      {:error, _} = Dns.create_record(%{
        type: :a,
        name: "other.#{domain.name}",
        records: ["1.2.3.4"],
      }, "cluster", :aws, other_user)
    end

    test "if a record already exists, it will update" do
      user = insert(:user)
      domain = insert(:dns_domain, account: user.account)
      record = insert(:dns_record, creator: user, domain: domain, name: "some.#{domain.name}")
      external_id = "12345"
      expect(DnsRecord, :update, fn _, _, _ -> dns_resp(external_id) end)

      {:ok, update} = Dns.create_record(%{
        type: :a,
        name: "some.#{domain.name}",
        records: ["3.4.5.6"],
      }, "cluster", :aws, user)

      assert update.id == record.id
      assert update.records == ["3.4.5.6"]
    end

    test "users in another account cannot create records for a domain" do
      user = insert(:user)
      domain = insert(:dns_domain)

      {:error, _} = Dns.create_record(%{
        type: :a,
        name: "some.#{domain.name}",
        records: ["1.2.3.4"],
      }, "cluster", :aws, user)
    end

    test "it cannot create if the domain doesn't exist" do
      user = insert(:user)

      {:error, _} = Dns.create_record(%{
        type: :a,
        name: "some.domain.onplural.sh",
        records: ["1.2.3.4"],
      }, "cluster", :aws, user)
    end

    test "records owned by another cluster cannot be overwritten" do
      user = insert(:user)
      domain = insert(:dns_domain, account: user.account, name: "some.onplural.sh")
      insert(:dns_record, name: "name.some.onplural.sh", domain: domain)

      {:error, _} = Dns.create_record(%{
        type: :a,
        name: "name.some.onplural.sh",
        records: ["1.2.3.4"]
      }, "other-cluster", :gcp, user)
    end
  end

  describe "#delete_record/3" do
    test "users can delete their own records" do
      user = insert(:user)
      record = insert(:dns_record, creator: user)
      expect(DnsRecord, :delete, fn _, _ -> dns_resp("ext-id") end)

      {:ok, del} = Dns.delete_record(record.name, record.type, user)

      assert del.id == record.id
      refute refetch(del)
    end

    test "users cannot delete other users' records" do
      user = insert(:user)
      record = insert(:dns_record, domain: build(:dns_domain, account: user.account))

      {:error, _} = Dns.delete_record(record.name, record.type, user)
    end
  end

  defp dns_resp(external_id) do
    {:ok, %Tesla.Env{body: %{"result" => %{"id" => external_id}}}}
  end
end
