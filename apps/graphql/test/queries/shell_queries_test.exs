defmodule GraphQl.ShellQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers
  use Mimic
  alias Core.Services.Shell.Pods

  describe "shell" do
    test "it can fetch a cloud shell instance including its liveness" do
      pod = Pods.pod("plrl-shell-1", "mjg@plural.sh")
      expect(Pods, :fetch, fn "plrl-shell-1" -> {:ok, pod} end)

      shell = insert(:cloud_shell, pod_name: "plrl-shell-1")

      {:ok, %{data: %{"shell" => found}}} = run_query("""
        query {
          shell { id alive }
        }
      """, %{}, %{current_user: shell.user})

      assert found["id"] == shell.id
      refute found["alive"]
    end
  end

  describe "scmAuthorization" do
    test "it can list authz urls for scm providers" do
      user = insert(:user)

      {:ok, %{data: %{"scmAuthorization" => [res]}}} = run_query("""
        query {
          scmAuthorization { provider url }
        }
      """, %{}, %{current_user: user})

      assert res["provider"] == "GITHUB"
      assert res["url"]
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
end
