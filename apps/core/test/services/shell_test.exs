defmodule Core.Services.ShellTest do
  use Core.SchemaCase, async: true
  alias Core.Services.{Shell, Dns}
  alias Kazan.Apis.Core.V1, as: CoreV1
  use Mimic

  describe "#create_shell/2" do
    test "a user can create a cloud shell" do
      user = insert(:user)

      expect(Kazan, :run, fn _ ->
        {:ok, Shell.Pods.pod("plrl-shell-1", user.email)}
      end)

      expect(HTTPoison, :post, 2, fn
        "https://api.github.com/user/repos", _, _ ->
          {:ok, %HTTPoison.Response{status_code: 200, body: Jason.encode!(%{
            ssh_url: "git@github.com:pluralsh/installations.git",
            full_name: "pluralsh/installations"
          })}}
        "https://api.github.com/repos/pluralsh/installations/keys", _, _ ->
          {:ok, %HTTPoison.Response{status_code: 200, body: "OK"}}
      end)

      {:ok, shell} = Shell.create_shell(%{
        provider: :aws,
        credentials: %{
          aws: %{access_key_id: "access_key", secret_access_key: "secret"}
        },
        scm: %{token: "tok", provider: :github, name: "installations"},
        workspace: %{
          cluster: "plural",
          bucket_prefix: "plrl",
          region: "us-east-1",
          subdomain: "sub.onplural.sh"
        }
      }, user)

      assert shell.user_id == user.id
      assert shell.aes_key
      assert shell.ssh_public_key
      assert shell.ssh_private_key
      assert shell.git_url == "git@github.com:pluralsh/installations.git"
      assert shell.provider == :aws
      assert shell.credentials.aws.access_key_id == "access_key"
      assert shell.credentials.aws.secret_access_key == "secret"
      assert shell.workspace.cluster == "plural"
      assert shell.workspace.bucket_prefix == "plrl"
      assert shell.workspace.region == "us-east-1"
      assert shell.workspace.subdomain == "sub.onplural.sh"
      assert shell.workspace.bucket == "plrl-tf-state"

      assert Dns.get_domain("sub.onplural.sh")
    end
  end

  describe "#alive?/1" do
    test "it will return true if the pods conditions are all true" do
      pod = Shell.Pods.pod("plrl-shell-1", "mjg@plural.sh")
      conditions = Shell.Pods.conditions()
                   |> Enum.map(& %CoreV1.PodCondition{type: &1, status: "True"})
      pod = %{pod | status: %CoreV1.PodStatus{conditions: conditions}}
      expect(Kazan, :run, fn _ -> {:ok, pod} end)

      shell = insert(:cloud_shell, pod_name: "plrl-shell-1")
      assert Shell.alive?(shell)
    end

    test "if the conditions haven't been marked true, it will return false" do
      pod = Shell.Pods.pod("plrl-shell-1", "mjg@plural.sh")
      expect(Kazan, :run, fn _ -> {:ok, pod} end)

      shell = insert(:cloud_shell, pod_name: "plrl-shell-1")
      refute Shell.alive?(shell)
    end
  end

  describe "#stop/1" do
    test "it will delete the pod for a user's shell" do
      user = insert(:user)
      insert(:cloud_shell, user: user, pod_name: "plrl-shell-1")

      expect(Kazan, :run, 2, fn _ -> {:ok, Shell.Pods.pod("plrl-shell-1", user.email)} end)
      {:ok, true} = Shell.stop(user)
    end
  end

  describe "#delete/1" do
    test "it will delete the shell instance for a user" do
      user = insert(:user)
      shell = insert(:cloud_shell, user: user, pod_name: "plrl-shell-1")

      expect(Kazan, :run, 2, fn _ -> {:ok, Shell.Pods.pod("plrl-shell-1", user.email)} end)
      {:ok, s} = Shell.delete(user.id)

      assert s.id == shell.id
      refute refetch(shell)
    end
  end
end
