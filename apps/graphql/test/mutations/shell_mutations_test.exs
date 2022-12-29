defmodule GraphQl.ShellMutationsTest do
  use Core.SchemaCase, async: true
  use Mimic
  import GraphQl.TestHelpers
  alias Core.Services.Shell.Pods
  alias GoogleApi.CloudResourceManager.V3.Api.Projects

  describe "createShell" do
    test "it will create a new shell instance" do
      %{email: e} = user = insert(:user, roles: %{admin: true})

      expect(Pods, :fetch, fn _ -> {:ok, Pods.pod("plrl-shell-1", e)} end)
      expect(Core.Shell.Scm, :setup_repository, fn
        :github, ^e, "tok", nil, "demo" ->
          {:ok, "git@github.com:pluralsh/demo.git", "pub-key", "priv-key", nil}
      end)

      expect(Core.Clients.Vault, :write, fn _, _ -> {:ok, %{}} end)

      attrs = %{
        "provider" => "AWS",
        "scm" => %{"provider" => "GITHUB", "token" => "tok", "name" => "demo"},
        "workspace" => %{
          "cluster" => "plural",
          "region" => "us-east-1",
          "bucketPrefix" => "plrl",
          "subdomain" => "demo.onplural.sh"
        },
        "credentials" => %{
          "aws" => %{
            "accessKeyId" => "access-key",
            "secretAccessKey" => "secret-key"
          }
        }
      }

      {:ok, %{data: %{"createShell" => created}}} = run_query("""
        mutation Create($attrs: CloudShellAttributes!) {
          createShell(attributes: $attrs) {
            id
            provider
            gitUrl
            aesKey
          }
        }
      """, %{"attrs" => attrs}, %{current_user: user})

      assert created["id"]
      assert created["provider"] == "AWS"
      assert created["gitUrl"] == "git@github.com:pluralsh/demo.git"
      assert created["aesKey"]
    end
  end

  describe "setupShell" do
    test "it will call the setup api for a cloud shell instance" do
      user = insert(:user)
      shell = insert(:cloud_shell, user: user)

      expect(Core.Shell.Client, :setup, fn _ -> {:ok, %{}} end)

      {:ok, %{data: %{"setupShell" => found}}} = run_query("""
        mutation {
          setupShell { id }
        }
      """, %{}, %{current_user: user})

      assert found["id"] == shell.id
    end
  end

  describe "rebootShell" do
    test "it will reboot a shell's pod" do
      user = insert(:user)
      shell = insert(:cloud_shell, user: user)

      expect(Kazan, :run, fn _ -> {:ok, %{}} end)

      {:ok, %{data: %{"rebootShell" => r}}} = run_query("""
        mutation {
          rebootShell { id }
        }
      """, %{}, %{current_user: user})

      assert r["id"] == shell.id
    end
  end

  describe "deleteShell" do
    test "it will delete a shell for a user" do
      user = insert(:user)
      shell = insert(:cloud_shell, user: user, pod_name: "plrl-shell-1")

      expect(Pods, :fetch, fn "plrl-shell-1" -> {:ok, Pods.pod("plrl-shell-1", user.email)} end)
      expect(Pods, :delete, fn "plrl-shell-1" -> {:ok, Pods.pod("plrl-shell-1", user.email)} end)

      {:ok, %{data: %{"deleteShell" => s}}} = run_query("""
        mutation {
          deleteShell { id }
        }
      """, %{}, %{current_user: user})

      assert s["id"] == shell.id
      refute refetch(shell)
    end
  end

  describe "createDemoProject" do
    test "it will create a new demo project" do
      user = insert(:user)
      expect(Goth.Token, :for_scope, fn _ -> {:ok, %{token: "token"}} end)
      expect(Projects, :cloudresourcemanager_projects_create, fn _, [body: _] ->
        {:ok, %{name: "operations/123"}}
      end)

      {:ok, %{data: %{"createDemoProject" => demo}}} = run_query("""
        mutation {
          createDemoProject { id projectId ready state }
        }
      """, %{}, %{current_user: user})

      assert demo["id"]
      assert demo["projectId"]
      assert demo["state"] == "CREATED"
      refute demo["ready"]
    end
  end

  describe "deleteDemoProject" do
    test "it will delete demo project of current user" do
      demo = insert(:demo_project)

      expect(Goth.Token, :for_scope, fn _ -> {:ok, %{token: "token"}} end)
      expect(Projects, :cloudresourcemanager_projects_delete, fn _, _ ->
        {:ok, %{name: "operations/123"}}
      end)

      {:ok, %{data: %{"deleteDemoProject" => deleted}}} = run_query("""
        mutation { deleteDemoProject { id } }
      """, %{}, %{current_user: demo.user})

      assert deleted["id"]

      refute refetch(demo)
    end
  end

  describe "stopShell" do
    test "it will stop a shell for a user" do
      user = insert(:user)
      insert(:cloud_shell, user: user, pod_name: "plrl-shell-1")

      expect(Pods, :fetch, fn podName -> {:ok, Pods.pod(podName, user.email)} end)
      expect(Pods, :delete, fn podName -> {:ok, Pods.pod(podName, user.email)} end)

      {:ok, %{data: %{"stopShell" => stopped}}} = run_query("""
        mutation {
          stopShell
        }
      """, %{}, %{current_user: user})

      assert stopped
    end
  end

  describe "restartShell" do
    test "it will delete and recreate a shell for a user" do
      user = insert(:user)
      shell = insert(:cloud_shell, user: user, pod_name: "plrl-shell-1")

      expect(Pods, :fetch, fn podName -> {:ok, Pods.pod(podName, user.email)} end)
      expect(Pods, :delete, fn podName -> {:ok, Pods.pod(podName, user.email)} end)
      expect(Pods, :fetch, fn _ -> {:err, :not_found} end)
      expect(Pods, :create, fn podName, email -> {:ok, Pods.pod(podName, email)} end)

      {:ok, %{data: %{"restartShell" => restarted}}} = run_query("""
        mutation {
          restartShell
        }
      """, %{}, %{current_user: user})

      assert restarted
      assert refetch(shell)
    end
  end

  describe "transferDemoProject" do
    test "it will send out a transfer request" do
      demo = insert(:demo_project)

      proj_id = demo.project_id
      expect(Goth.Token, :for_scope, fn _ -> {:ok, %{token: "token"}} end)
      expect(Projects, :cloudresourcemanager_projects_move, fn _, ^proj_id, [body: %{destinationParent: "organizations/org-id"}] ->
        {:ok, %{}}
      end)

      {:ok, %{data: %{"transferDemoProject" => %{"id" => id}}}} = run_query("""
        mutation {
          transferDemoProject(organizationId: "org-id") { id }
        }
      """, %{}, %{current_user: demo.user})

      assert id == demo.id
      refute refetch(demo)
    end
  end

  describe "installBundle" do
    setup [:setup_root_user]
    test "it can install a bundle crazily enough", %{user: user} do
      pod_name = "plrl-shell-1"
      insert(:cloud_shell, user: user, pod_name: pod_name, workspace: %{subdomain: "example.com"})
      expect(Pods, :ip, fn ^pod_name -> {:ok, "0.1.2.3"} end)
      expect(HTTPoison, :request, fn :post, "http://0.1.2.3:8080/v1/context/configuration", _, _, _ -> {:ok, %HTTPoison.Response{status_code: 200}} end)
      expect(HTTPoison, :post, fn _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{client_id: "123", client_secret: "secret"})}}
      end)

      repo = insert(:repository)
      recipe = insert(:recipe, repository: repo, provider: :aws, oidc_settings: %{auth_method: :post, uri_format: "https://{domain}/oidc", domain_key: "key"})
      section = insert(:recipe_section, repository: repo, recipe: recipe)
      %{repository: repo2} = section2 = insert(:recipe_section, recipe: recipe)
      chart = insert(:chart, repository: repo)
      insert(:version, chart: chart, version: chart.latest_version)
      other_chart = insert(:chart, repository: repo2)
      insert(:version, chart: other_chart, version: other_chart.latest_version)
      tf = insert(:terraform, repository: repo2)
      insert(:version, terraform: tf, version: tf.latest_version, chart: nil)
      insert(:recipe_item, recipe_section: section, chart: chart)
      insert(:recipe_item, recipe_section: section2, terraform: tf)
      insert(:recipe_item, recipe_section: section2, chart: other_chart)

      {:ok, %{data: %{"installBundle" => [_ | _]}}} = run_query("""
        mutation Install($repo: String!, $name: String!, $context: ContextAttributes!) {
          installBundle(repo: $repo, name: $name, oidc: true, context: $context) { id }
        }
      """, %{
        "repo" => repo.name,
        "name" => recipe.name,
        "context" => %{"buckets" => ["bucket"], "configuration" => Poison.encode!(%{repo.name => %{"key" => "example.com"}})}
      }, %{current_user: user})
    end
  end

  describe "installStackShell" do
    setup [:setup_root_user]
    test "it can install a stack w/in a cloud shell crazily enough", %{user: user} do
      pod_name = "plrl-shell-1"
      insert(:cloud_shell, user: user, pod_name: pod_name, provider: :aws, workspace: %{subdomain: "example.com"})
      expect(Pods, :ip, fn ^pod_name -> {:ok, "0.1.2.3"} end)
      expect(HTTPoison, :request, fn :post, "http://0.1.2.3:8080/v1/context/configuration", _, _, _ -> {:ok, %HTTPoison.Response{status_code: 200}} end)
      expect(HTTPoison, :post, fn _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{client_id: "123", client_secret: "secret"})}}
      end)

      repo = insert(:repository)
      recipe = insert(:recipe, repository: repo, provider: :aws, oidc_settings: %{auth_method: :post, uri_format: "https://{domain}/oidc", domain_key: "key"})
      section = insert(:recipe_section, repository: repo, recipe: recipe)
      %{repository: repo2} = section2 = insert(:recipe_section, recipe: recipe)
      chart = insert(:chart, repository: repo)
      insert(:version, chart: chart, version: chart.latest_version)
      other_chart = insert(:chart, repository: repo2)
      insert(:version, chart: other_chart, version: other_chart.latest_version)
      tf = insert(:terraform, repository: repo2)
      insert(:version, terraform: tf, version: tf.latest_version, chart: nil)
      insert(:recipe_item, recipe_section: section, chart: chart)
      insert(:recipe_item, recipe_section: section2, terraform: tf)
      insert(:recipe_item, recipe_section: section2, chart: other_chart)

      stack = insert(:stack)
      collection = insert(:stack_collection, provider: :aws, stack: stack)
      insert(:stack_recipe, collection: collection, recipe: recipe)

      {:ok, %{data: %{"installStackShell" => [_ | _]}}} = run_query("""
        mutation Install($name: String!, $context: ContextAttributes!) {
          installStackShell(name: $name, oidc: true, context: $context) { id }
        }
      """, %{
        "name" => stack.name,
        "context" => %{"configuration" => Poison.encode!(%{repo.name => %{"key" => "example.com"}})}
      }, %{current_user: user})
    end
  end
end
