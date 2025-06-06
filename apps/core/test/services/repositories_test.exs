defmodule Core.Services.RepositoriesTest do
  use Core.SchemaCase, async: true

  use Mimic
  alias Core.PubSub
  alias Core.Services.Repositories
  alias Piazza.Crypto.RSA

  describe "#create_repository" do
    test "It will create a repository for the user's publisher" do
      %{owner: user} = insert(:publisher)

      {:ok, repo} = Repositories.create_repository(%{
        name: "piazza",
        category: :data,
        community: %{
          discord: "discord.com/piazza",
          twitter: "twitter.com/piazza",
          videos: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"]
        }
      }, user)

      assert repo.name == "piazza"
      assert repo.category == :data
      assert repo.community.discord == "discord.com/piazza"
      assert repo.community.slack == nil
      assert repo.community.twitter == "twitter.com/piazza"
      assert repo.community.videos == ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"]
      assert is_binary(repo.public_key)
      assert is_binary(repo.private_key)

      assert_receive {:event, %PubSub.RepositoryCreated{item: ^repo, actor: ^user}}
    end

    test "It can create an associated integration resource definition" do
      %{owner: user} = insert(:publisher)

      {:ok, repo} = Repositories.create_repository(%{
        name: "piazza",
        category: :data,
        integration_resource_definition: %{
          name: "piazza",
          spec: [%{type: :int, name: "int"}, %{type: :string, name: "str"}]
        }
      }, user)

      assert repo.integration_resource_definition.name == "piazza"
      [%{type: :int, name: "int"}, %{type: :string, name: "str"}] = repo.integration_resource_definition.spec
    end
  end

  describe "#release_channels/1" do
    test "it can fetch eligible release channels" do
      repo  = insert(:repository)
      repo2 = insert(:repository)
      insert(:version_tag, tag: "one", chart: build(:chart, repository: repo))
      insert(:version_tag, tag: "two", terraform: build(:terraform, repository: repo))
      insert(:version_tag, tag: "one", terraform: build(:terraform, repository: repo))
      insert(:version_tag, tag: "three", chart: build(:chart, repository: repo))

      insert(:version_tag, tag: "four", terraform: build(:terraform, repository: repo2))

      result = Repositories.upgrade_channels(repo)
      assert MapSet.new(result)
            |> MapSet.equal?(MapSet.new(~w(one two three)))
    end
  end

  describe "#upsert_repository" do
    test "It will create a repository for the user's publisher" do
      %{owner: user} = pub = insert(:publisher)

      {:ok, repo} = Repositories.upsert_repository(%{category: :data}, "piazza", pub.id,  user)

      assert repo.name == "piazza"
      assert repo.category == :data
      assert is_binary(repo.public_key)
      assert is_binary(repo.private_key)

      assert_receive {:event, %PubSub.RepositoryCreated{item: ^repo, actor: ^user}}
    end
  end

  describe "#update_repository" do
    test "Users can update their repositories" do
      %{owner: user} = publisher = insert(:publisher)
      repo = insert(:repository, publisher: publisher)

      {:ok, updated} = Repositories.update_repository(%{
        name: "piazza",
        community: %{
          twitter: "twitter.com/piazza",
          videos: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"]
        }
      }, repo.id, user)

      assert updated.name == "piazza"
      assert updated.community.twitter == "twitter.com/piazza"
      assert updated.community.videos == ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"]

      assert_receive {:event, %PubSub.RepositoryUpdated{item: ^updated, actor: ^user}}
    end

    test "It can update integration resource definitions" do
      %{owner: user} = publisher = insert(:publisher)
      repo = insert(:repository, publisher: publisher)

      {:ok, updated} = Repositories.update_repository(%{
        name: "piazza",
        integration_resource_definition: %{
          name: "piazza",
          spec: [%{type: :int, name: "int"}, %{type: :string, name: "str"}]
        }
      }, repo.id, user)

      assert updated.id == repo.id
      assert updated.integration_resource_definition.name == "piazza"
      [%{type: :int, name: "int"}, %{type: :string, name: "str"}] = updated.integration_resource_definition.spec
    end

    test "Nonpublishers cannot update other's repositories" do
      user = insert(:user)
      {:ok, %{user: user}} = Core.Services.Accounts.create_account(user)
      repo = insert(:repository)

      {:error, _} = Repositories.update_repository(%{name: "piazza"}, repo.id, user)
    end
  end

  describe "#create_installation" do
    setup [:setup_root_user]
    test "Users can install other repositories", %{user: user} do
      repo = insert(:repository)

      {:ok, installation} = Repositories.create_installation(%{}, repo.id, user)

      assert installation.auto_upgrade
      assert installation.user_id == user.id
      assert installation.repository_id == repo.id
      assert installation.license_key
      assert installation.track_tag == "latest"
      assert installation.source == :default

      assert_receive {:event, %PubSub.InstallationCreated{item: ^installation, actor: ^user}}
    end

    test "It will set :demo as source if a demo project exists", %{user: user} do
      repo = insert(:repository)
      insert(:cloud_shell, user: user)
      insert(:demo_project, user: user)

      {:ok, installation} = Repositories.create_installation(%{}, repo.id, user)

      assert installation.auto_upgrade
      assert installation.user_id == user.id
      assert installation.repository_id == repo.id
      assert installation.license_key
      assert installation.track_tag == "latest"
      assert installation.source == :demo

      assert_receive {:event, %PubSub.InstallationCreated{item: ^installation, actor: ^user}}
    end

    test "It will set :shell as source if a cloud shell exists", %{user: user} do
      repo = insert(:repository)
      insert(:cloud_shell, user: user)

      {:ok, installation} = Repositories.create_installation(%{}, repo.id, user)

      assert installation.auto_upgrade
      assert installation.user_id == user.id
      assert installation.repository_id == repo.id
      assert installation.license_key
      assert installation.track_tag == "latest"
      assert installation.source == :shell

      assert_receive {:event, %PubSub.InstallationCreated{item: ^installation, actor: ^user}}
    end

    test "repositories can delegate track_tag", %{user: user} do
      repo = insert(:repository, default_tag: "stable")

      {:ok, installation} = Repositories.create_installation(%{}, repo.id, user)

      assert installation.auto_upgrade
      assert installation.user_id == user.id
      assert installation.repository_id == repo.id
      assert installation.license_key
      assert installation.track_tag == "stable"

      assert_receive {:event, %PubSub.InstallationCreated{item: ^installation, actor: ^user}}
    end
  end

  describe "update_installation" do
    test "Users can update their installations" do
      %{user: user} = inst = insert(:installation)

      {:ok, updated} = Repositories.update_installation(%{context: %{some: "value"}}, inst.id, user)

      assert_receive {:event, %PubSub.InstallationUpdated{item: ^updated}}
      assert updated.context.some == "value"
    end

    test "updates to track tags propagate to package installations" do
      %{user: user, repository: repo} = inst = insert(:installation)

      chart = insert(:chart, repository: repo)
      ci = insert(:chart_installation, chart: chart, installation: inst)
      vt = insert(:version_tag, chart: chart, tag: "new", version: build(:version, chart: chart))
      ti = insert(:terraform_installation, terraform: build(:terraform, repository: repo))

      {:ok, updated} = Repositories.update_installation(%{track_tag: "new"}, inst.id, user)

      assert updated.id == inst.id
      assert updated.tag_updated
      assert updated.track_tag == "new"
      assert_receive {:event, %PubSub.InstallationUpdated{item: ^updated}}


      assert refetch(ci).version_id == vt.version_id
      assert refetch(ti).version_id == ti.version_id
    end

    test "Other users cannot update" do
      user = insert(:user)
      inst = insert(:installation)

      {:error, _} = Repositories.update_installation(%{context: %{some: "val"}}, inst.id, user)
    end
  end

  describe "#delete_installation" do
    test "Users can delete their installations" do
      %{user: user} = inst = insert(:installation)

      {:ok, deleted} = Repositories.delete_installation(inst.id, user)

      assert deleted.id == inst.id
      refute refetch(deleted)

      assert_receive {:event, %PubSub.InstallationDeleted{item: ^deleted, actor: ^user}}
    end

    test "It will cancel associated subscriptions when present" do
      user = insert(:user)
      repo = insert(:repository, publisher: build(:publisher, billing_account_id: "acct_id"))
      inst = insert(:installation, repository: repo, user: user)
      sub  = insert(:subscription, installation: inst, external_id: "sub_id")
      expect(Stripe.Subscription, :cancel, fn "sub_id", [connect_account: "acct_id"] -> {:ok, %{}} end)

      {:ok, _deleted} = Repositories.delete_installation(inst.id, user)

      refute refetch(inst)
      refute refetch(sub)
    end

    test "Other users cannot delete" do
      inst = insert(:installation)

      {:error, _} = Repositories.delete_installation(inst.id, insert(:user))
    end
  end

  describe "#delete_repository" do
    test "Publishers can delete repos" do
      %{owner: user} = pub = insert(:publisher)
      repo = insert(:repository, publisher: pub)

      {:ok, repo} = Repositories.delete_repository(repo.id, user)

      refute refetch(repo)
    end

    test "Non publishers cannot delete" do
      repo = insert(:repository)

      {:error, _} = Repositories.delete_repository(repo.id, insert(:user))
    end
  end

  describe "#upsert_integration/3" do
    test "A publisher can upsert an integrations" do
      %{owner: user} = pub = insert(:publisher)
      repo = insert(:repository,
        publisher: pub,
        integration_resource_definition: build(:resource_definition,
          spec: [
            build(:specification, type: :string, name: "str")
          ]
        )
      )

      {:ok, integration} = Repositories.upsert_integration(%{
        name: "github",
        spec: %{"str" => "a value"},
        tags: [%{tag: "some"}, %{tag: "tag"}]
      }, repo.id, user)

      assert integration.name == "github"
      assert integration.publisher_id  == pub.id
      assert integration.spec["str"] == "a value"
      integration = refetch(integration) |> Core.Repo.preload([:tags])
      assert Enum.map(integration.tags, & &1.tag)
             |> Enum.sort() == ["some", "tag"]

      {:ok, integration} = Repositories.upsert_integration(%{
        name: "github",
        spec: %{"str" => "a different value"},
        tags: [%{tag: "another"}, %{tag: "tag"}]
      }, repo.id, user)

      assert integration.name == "github"
      assert integration.spec["str"] == "a different value"
      integration = refetch(integration) |> Core.Repo.preload([:tags])
      assert Enum.map(integration.tags, & &1.tag)
             |> Enum.sort() == ["another", "tag"]
    end

    test "Non publishers cannot add integrations" do
      repo = insert(:repository,
        integration_resource_definition: build(:resource_definition,
          spec: [
            build(:specification, type: :string, name: "str")
          ]
        )
      )

      {:error, _} = Repositories.upsert_integration(%{
        name: "github",
        spec: %{"str" => "a value"}
      }, repo.id, insert(:user))
    end

    test "It will enforce resource definitions" do
      %{owner: user} = pub = insert(:publisher)
      repo = insert(:repository,
        publisher: pub,
        integration_resource_definition: build(:resource_definition,
          spec: [
            build(:specification, type: :string, name: "str")
          ]
        )
      )

      {:error, %Ecto.Changeset{}} = Repositories.upsert_integration(%{
        name: "github",
        spec: %{"str" => 1}
      }, repo.id, user)
    end
  end

  describe "#update_docker_repository/3" do
    test "a publisher can update a dkr repository" do
      %{owner: user} = pub = insert(:publisher)
      dkr = insert(:docker_repository, repository: build(:repository, publisher: pub))

      {:ok, updated} = Repositories.update_docker_repository(%{public: true}, dkr.id, user)

      assert updated.public

      assert_receive {:event, %PubSub.DockerRepositoryUpdated{item: ^updated}}
    end
  end

  describe "#authorize_docker/2" do
    test "A repo owner can push/pull" do
      %{owner: user} = pub = insert(:publisher)
      repo = insert(:repository, publisher: pub)

      allowed = Repositories.authorize_docker(repo.name, "some/image", user)

      assert [:pull, :push] == Enum.sort(allowed)
    end

    test "An installer can pull" do
      repo = insert(:repository)
      %{user: user} = insert(:installation, repository: repo)

      [:pull] = Repositories.authorize_docker(repo.name, "some/image", user)
    end

    test "public repositories can authorize unauthenticated users" do
      %{repository: repo} = registry = insert(:docker_repository, public: true)

      [:pull] = Repositories.authorize_docker(repo.name, registry.name, nil)
    end

    test "Arbitrary users have no access" do
      repo = insert(:repository)

      [] = Repositories.authorize_docker(repo.name, "some/image", insert(:user))
    end
  end

  describe "#generate_license/1" do
    test "It can generate an ecrypted license for an installation" do
      publisher = insert(:publisher)
      {:ok, repo} = Repositories.create_repository(%{
        name: "my-repo",
        category: :data,
        secrets: %{"token" => "a"}
      }, publisher.owner)

      installation = insert(:installation, repository: repo)

      {:ok, license} = Repositories.generate_license(installation)

      {:ok, decoded} = RSA.decrypt(license, ExPublicKey.loads!(repo.public_key))
      %{"refresh_token" => token, "expires_at" => expiry, "secrets" => secrets} = Jason.decode!(decoded)
      assert secrets["token"] == "a"
      {:ok, _} = Timex.parse(expiry, "{ISO:Extended}")
      {:ok, license} = Repositories.refresh_license(token)

      {:ok, decoded} = RSA.decrypt(license, ExPublicKey.loads!(repo.public_key))
      %{"refresh_token" => _} = Jason.decode!(decoded)
    end

    test "It can generate licenses for paid plans" do
      publisher = insert(:publisher)
      {:ok, repo} = Repositories.create_repository(%{name: "my-repo", category: :data}, publisher.owner)
      installation = insert(:installation, repository: repo)
      plan = insert(:plan,
        repository: repo,
        line_items: %{
          included: [%{dimension: "user", quantity: 1}, %{dimension: "storage", quantity: 0}],
          items: [
            %{dimension: "user", name: "Users", cost: 500},
            %{dimension: "storage", name: "Users", cost: 500}
          ]
        },
        metadata: %{
          features: [%{name: "sso", description: "does sso"}]
        }
      )
      insert(:subscription,
        installation: installation,
        plan: plan,
        line_items: %{
          items: [%{dimension: "user", quantity: 1}, %{dimension: "storage", quantity: 3}]
        }
      )
      {:ok, license} = Repositories.generate_license(installation)
      {:ok, decoded} = RSA.decrypt(license, ExPublicKey.loads!(repo.public_key))
      %{"policy" => %{"limits" => limits, "features" => [%{"name" => "sso"}]}} = Jason.decode!(decoded)

      assert limits["storage"] == 3
      assert limits["user"] == 2
    end

    test "It will not generate licenses if there is no subscription for a non-free repo" do
      publisher = insert(:publisher)
      {:ok, repo} = Repositories.create_repository(%{name: "my-repo", category: :data}, publisher.owner)
      installation = insert(:installation, repository: repo)
      insert(:plan, repository: repo)

      {:ok, nil} =  Repositories.generate_license(installation)
    end
  end

  describe "#create_docker_image/3" do
    test "It can upsert a new docker repo/image" do
      repository = insert(:repository)
      user = insert(:user)
      repo_name = "#{repository.name}/dkr_repo"

      {:ok, %{repo: repo, image: image}} = Repositories.create_docker_image(repo_name, "latest", "some_digest", user)

      assert repo.name == "dkr_repo"
      assert repo.repository_id == repository.id

      assert image.tag == "latest"
      assert image.docker_repository_id == repo.id
      assert image.digest == "some_digest"

      assert_receive {:event, %PubSub.DockerImageCreated{item: found, actor: ^user}}

      assert found.id == image.id
    end
  end

  describe "#add_vulnerabilities/2" do
    test "it will add vulnerabilities to an image and grade it afterwards" do
      image = insert(:docker_image)
      vuln = Application.get_env(:core, :vulnerability) |> Jason.decode!()
      vuln = Core.Docker.TrivySource.to_vulnerability(vuln)

      {:ok, %{vulnerabilities: [vuln]} = image} = Repositories.add_vulnerabilities([vuln], image)

      assert vuln.image_id == image.id

      assert image.scan_completed_at
      assert image.grade == :c
    end
  end

  describe "#retry_scan/1" do
    test "if a scan has < 2 retries it's retriable" do
      image = insert(:docker_image, scan_retries: 1)

      {:ok, img} = Repositories.retry_scan(image)

      assert img.id == image.id
      assert img.scan_retries == 2
    end

    test "images with >= 2 retries are completed" do
      image = insert(:docker_image, scan_retries: 2)

      {:ok, img} = Repositories.retry_scan(image)

      assert img.id == image.id
      assert img.scan_retries == 0
      assert img.scan_completed_at
    end
  end

  describe "#create_artifact/3" do
    test "Publishers can create artifacts" do
      %{publisher: %{owner: user}} = repo = insert(:repository)

      {:ok, artifact} = Repositories.create_artifact(%{
        name: "artifact",
        readme: "empty",
        type: :cli,
        platform: :mac
      }, repo.id, user)

      assert artifact.name == "artifact"
      assert artifact.readme == "empty"
      assert artifact.type == :cli
      assert artifact.platform == :mac
    end

    test "non publishers cannot create artifacts" do
      repo = insert(:repository)

      {:error, _} = Repositories.create_artifact(%{
        name: "artifact",
        readme: "empty",
        type: :cli,
        platform: :mac
      }, repo.id, insert(:user))
    end
  end

  describe "#create_oidc_provider/3" do
    test "a user can create a provider for their installation" do
      account = insert(:account)
      installation = insert(:installation, user: build(:user, account: account))
      group = insert(:group, account: account)
      expect(HTTPoison, :post, fn _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{client_id: "123", client_secret: "secret"})}}
      end)

      {:ok, oidc} = Repositories.create_oidc_provider(%{
        redirect_uris: ["https://example.com"],
        auth_method: :basic,
        bindings: [%{user_id: installation.user_id}, %{group_id: group.id}]
      }, installation.id, installation.user)

      assert oidc.client_id == "123"
      assert oidc.client_secret == "secret"
      assert oidc.redirect_uris == ["https://example.com"]

      [first, second] = oidc.bindings

      assert first.user_id == installation.user_id
      assert second.group_id == group.id

      assert_receive {:event, %PubSub.OIDCProviderCreated{item: ^oidc}}
    end

    test "it will propagate a service accounts bindings" do
      account = insert(:account)
      sa = insert(:user, service_account: true, account: account)
      policy = insert(:impersonation_policy, user: sa)
      binding = insert(:impersonation_policy_binding, policy: policy, group: insert(:group, account: account))

      installation = insert(:installation, user: sa)
      group = insert(:group, account: account)
      expect(HTTPoison, :post, fn _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{client_id: "123", client_secret: "secret"})}}
      end)

      {:ok, oidc} = Repositories.create_oidc_provider(%{
        redirect_uris: ["https://example.com"],
        auth_method: :basic,
        bindings: [%{user_id: installation.user_id}, %{group_id: group.id}]
      }, installation.id, sa)

      assert oidc.client_id == "123"
      assert oidc.client_secret == "secret"
      assert oidc.redirect_uris == ["https://example.com"]

      [first, second, third] = oidc.bindings

      assert first.user_id == installation.user_id
      assert second.group_id == group.id
      assert third.group_id == binding.group_id

      assert_receive {:event, %PubSub.OIDCProviderCreated{item: ^oidc}}
    end
  end

  describe "#update_oidc_provider/3" do
    test "it can update an oidc provider's attributes" do
      installation = insert(:installation)
      oidc = insert(:oidc_provider, installation: installation)
      expect(HTTPoison, :put, fn _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{client_id: "123", client_secret: "secret"})}}
      end)

      {:ok, updated} = Repositories.update_oidc_provider(%{
        redirect_uris: ["https://example.com"],
        auth_method: :basic
      }, installation.id, installation.user)

      assert updated.id == oidc.id
      assert updated.auth_method == :basic

      assert_receive {:event, %PubSub.OIDCProviderUpdated{item: ^updated}}
    end
  end

  describe "#upsert_oidc_provider/3" do
    test "a user can create a provider for their installation" do
      account = insert(:account)
      installation = insert(:installation, user: build(:user, account: account))
      group = insert(:group, account: account)
      expect(HTTPoison, :post, fn _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{client_id: "123", client_secret: "secret"})}}
      end)

      {:ok, oidc} = Repositories.upsert_oidc_provider(%{
        redirect_uris: ["https://example.com"],
        auth_method: :basic,
        bindings: [%{user_id: installation.user_id}, %{group_id: group.id}]
      }, installation.id, installation.user)

      assert oidc.client_id == "123"
      assert oidc.client_secret == "secret"
      assert oidc.redirect_uris == ["https://example.com"]

      [first, second] = oidc.bindings

      assert first.user_id == installation.user_id
      assert second.group_id == group.id

      assert_receive {:event, %PubSub.OIDCProviderCreated{item: ^oidc}}
    end

    test "it can update an oidc provider's attributes" do
      installation = insert(:installation)
      oidc = insert(:oidc_provider, installation: installation)
      expect(HTTPoison, :put, fn _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{client_id: "123", client_secret: "secret"})}}
      end)

      {:ok, updated} = Repositories.upsert_oidc_provider(%{
        redirect_uris: ["https://example.com"],
        auth_method: :basic
      }, installation.id, installation.user)

      assert updated.id == oidc.id
      assert updated.auth_method == :basic

      assert_receive {:event, %PubSub.OIDCProviderUpdated{item: ^updated}}
    end
  end

  describe "#delete_oidc_provider/2" do
    test "it can delete an oidc provider for an installation" do
      installation = insert(:installation)
      oidc = insert(:oidc_provider, installation: installation)
      expect(HTTPoison, :delete, fn _, _ -> {:ok, %{status_code: 204, body: ""}} end)

      {:ok, deleted} = Repositories.delete_oidc_provider(installation.id, installation.user)

      assert deleted.id == oidc.id
      refute refetch(deleted)
    end
  end

  describe "#acquire_apply_lock/2" do
    test "A user can create an apply lock if they have repo edit permission" do
      %{owner: user} = pub = insert(:publisher)
      repo = insert(:repository, publisher: pub)

      {:ok, lock} = Repositories.acquire_apply_lock(repo.id, user)

      assert lock.owner_id == user.id
      assert lock.repository_id == repo.id
    end

    test "A user can create an existing apply lock if there is no owner" do
      %{owner: user} = pub = insert(:publisher)
      repo = insert(:repository, publisher: pub)
      lock = insert(:apply_lock, repository: repo)

      {:ok, acquired} = Repositories.acquire_apply_lock(repo.id, user)

      assert acquired.id == lock.id
      assert acquired.owner_id == user.id
    end

    test "a lock with an owner cannot be acquired" do
      %{owner: user} = pub = insert(:publisher)
      repo = insert(:repository, publisher: pub)
      insert(:apply_lock, repository: repo, owner: build(:user))

      {:error, _} = Repositories.acquire_apply_lock(repo.id, user)
    end

    test "an owned lock that expired can be acquired" do
      %{owner: user} = pub = insert(:publisher)
      repo = insert(:repository, publisher: pub)
      old = Timex.now() |> Timex.shift(minutes: -7)
      lock = insert(:apply_lock, repository: repo, owner: build(:user), updated_at: old)

      {:ok, acquired} = Repositories.acquire_apply_lock(repo.id, user)

      assert acquired.id == lock.id
      assert acquired.owner_id == user.id
    end
  end

  describe "#release_apply_lock/3" do
    test "A lock owner can save a lock and release ownership" do
      lock = insert(:apply_lock, owner: build(:user))

      {:ok, release} = Repositories.release_apply_lock(
        %{lock: "test"},
        lock.repository_id,
        lock.owner
      )

      assert release.id == lock.id
      assert release.lock == "test"
      refute release.owner_id
    end

    test "non-owners cannot release locks" do
      lock = insert(:apply_lock, owner: build(:user))

      {:error, _} = Repositories.release_apply_lock(
        %{lock: "test"},
        lock.repository_id,
        insert(:user)
      )
    end
  end

  describe "#reset_installations/1" do
    test "it will delete all installations for a user and reset their provider pin" do
      user = insert(:user, provider: :aws)
      insts = insert_list(3, :installation, user: user)

      {:ok, 3} = Repositories.reset_installations(user)

      refute refetch(user).provider
      for inst <- insts,
        do: refute refetch(inst)
    end
  end

  describe "#synced/1" do
    test "it can mark module installations as synced" do
      inst = insert(:installation)
      ci = insert(:chart_installation, installation: inst)

      {:ok, _} = Repositories.synced(inst)

      assert refetch(ci).synced
    end
  end

  describe "#documentation/1" do
    test "it will find docs" do
      repo = insert(:repository, docs: %{file_name: "f", updated_at: nil})

      contents = priv_file(:core, "docs.tgz") |> File.read!()
      expect(HTTPoison, :get, fn _, _, _ -> {:ok, %HTTPoison.Response{status_code: 200, body: contents}} end)

      {:ok, files} = Repositories.documentation(repo)

      by_name = Map.new(files)

      assert by_name["test.md"] == "hello world"
      assert by_name["other.md"] == "another file"
    end
  end
end
