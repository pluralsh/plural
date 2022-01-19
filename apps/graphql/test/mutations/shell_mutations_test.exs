defmodule GraphQl.ShellMutationsTest do
  use Core.SchemaCase, async: true
  use Mimic
  import GraphQl.TestHelpers
  alias Core.Services.Shell.Pods

  describe "createShell" do
    test "it will create a new shell instance" do
      %{email: e} = user = insert(:user)

      expect(Pods, :fetch, fn _ -> {:ok, Pods.pod("plrl-shell-1")} end)
      expect(Core.Shell.Scm, :setup_repository, fn
        :github, ^e, "tok", nil, "demo" ->
          {:ok, "git@github.com:pluralsh/demo.git", "pub-key", "priv-key"}
      end)

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
end
