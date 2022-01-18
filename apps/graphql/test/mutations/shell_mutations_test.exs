defmodule GraphQl.ShellMutationsTest do
  use Core.SchemaCase, async: true
  use Mimic
  import GraphQl.TestHelpers
  alias Core.Services.Shell.Pods

  describe "createShell" do
    test "it will create a new shell instance" do
      user = insert(:user)

      expect(Pods, :fetch, fn _ -> {:ok, Pods.pod("plrl-shell-1")} end)

      attrs = %{
        "provider" => "AWS",
        "sshPublicKey" => "pub-key",
        "sshPrivateKey" => "priv-key",
        "gitUrl" => "git@github.com:pluralsh/demo.git",
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
end
