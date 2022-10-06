defmodule GraphQl.ShellQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers
  use Mimic
  alias Core.Services.Shell.Pods
  alias GoogleApi.CloudResourceManager.V3

  describe "shell" do
    test "it can fetch a cloud shell instance including its liveness" do
      pod = Pods.pod("plrl-shell-1", "mjg@plural.sh")
      expect(Pods, :fetch, fn "plrl-shell-1" -> {:ok, pod} end)

      shell = insert(:cloud_shell, pod_name: "plrl-shell-1", workspace: %{cluster: "cluster"})

      {:ok, %{data: %{"shell" => found}}} = run_query("""
        query {
          shell { id alive cluster }
        }
      """, %{}, %{current_user: shell.user})

      assert found["id"] == shell.id
      assert found["cluster"] == "cluster"
      refute found["alive"]
    end
  end

  describe "scmAuthorization" do
    test "it can list authz urls for scm providers" do
      user = insert(:user)

      {:ok, %{data: %{"scmAuthorization" => [github, gitlab]}}} = run_query("""
        query {
          scmAuthorization { provider url }
        }
      """, %{}, %{current_user: user})

      assert github["provider"] == "GITHUB"
      assert github["url"]

      assert gitlab["provider"] == "GITLAB"
      assert gitlab["url"]
    end
  end

  describe "scmToken" do
    test "it can fetch an access token for an scm provider" do
      user = insert(:user)

      expect(Core.Shell.Scm, :get_token, fn :github, "code" -> {:ok, "access"} end)

      {:ok, %{data: %{"scmToken" => tok}}} = run_query("""
        query Token($code: String!, $prov: ScmProvider!) {
          scmToken(code: $code, provider: $prov)
        }
      """, %{"code" => "code", "prov" => "GITHUB"}, %{current_user: user})

      assert tok == "access"
    end
  end

  describe "demoProject" do
    test "it will poll a demo project for the given id" do
      demo = insert(:demo_project)

      expect(Goth.Token, :for_scope, fn _ -> {:ok, %{token: "token"}} end)
      expect(V3.Api.Operations, :cloudresourcemanager_operations_get, fn _, _ ->
        {:ok, %V3.Model.Operation{done: false}}
      end)

      {:ok, %{data: %{"demoProject" => found}}} = run_query("""
        query Demo($id: ID!) {
          demoProject(id: $id) { id }
        }
      """, %{"id" => demo.id}, %{current_user: demo.user})

      assert found["id"] == demo.id
    end

    test "it will poll a demo project for the current user" do
      demo = insert(:demo_project)

      expect(Goth.Token, :for_scope, fn _ -> {:ok, %{token: "token"}} end)
      expect(V3.Api.Operations, :cloudresourcemanager_operations_get, fn _, _ ->
        {:ok, %V3.Model.Operation{done: false}}
      end)

      {:ok, %{data: %{"demoProject" => found}}} = run_query("""
        query Demo($id: ID) {
          demoProject(id: $id) { id }
        }
      """, %{"id" => nil}, %{current_user: demo.user})

      assert found["id"] == demo.id
    end

    test "it will return not found when polling a non-existing demo project for the user" do
      user = insert(:user)

      {:ok, %{data: %{"demoProject" => _}, errors: [%{code: code, locations: _, message: message, path: _}]}} = run_query("""
        query Demo($id: ID) {
          demoProject(id: $id) { id }
        }
      """, %{"id" => nil}, %{current_user: user})

      assert code == 404
      assert message == "Demo project not found"
    end
  end
end
