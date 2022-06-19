defmodule Core.Shell.ClientTest do
  use Core.SchemaCase, async: true
  alias Kazan.Apis.Core.V1, as: CoreV1
  alias Core.Services.Shell.Pods
  alias Core.Shell.Client
  use Mimic

  describe "#setup/1" do
    test "it will post to the setup endpoint of the shell pod" do
      pod = Pods.pod("plrl-shell-1", "mjg@plural.sh")
      expect(Kazan, :run, fn _ -> {:ok, %{pod | status: %CoreV1.PodStatus{pod_ip: "10.0.1.0"}}} end)
      expect(HTTPoison, :post, fn "http://10.0.1.0:8080/v1/setup", _, _, _ ->
        {:ok, %HTTPoison.Response{status_code: 200, body: "OK"}}
      end)

      shell = insert(:cloud_shell, pod_name: "plrl-shell-1")
      {:ok, true} = Client.setup(shell)
    end
  end

  describe "#request/1" do
    test "it will construct a complete setup request" do
      shell = insert(:cloud_shell, demo: build(:demo_project))

      {:ok, req} = Client.request(shell)
      {:ok, token} = Core.Services.Users.access_token(shell.user)

      assert req.user.access_token == token.token
      assert req.is_demo
    end
  end
end
