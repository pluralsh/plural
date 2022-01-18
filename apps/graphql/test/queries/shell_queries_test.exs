defmodule GraphQl.ShellQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers
  use Mimic
  alias Core.Services.Shell.Pods

  describe "shell" do
    test "it can fetch a cloud shell instance including its liveness" do
      pod = Pods.pod("plrl-shell-1")
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
end
