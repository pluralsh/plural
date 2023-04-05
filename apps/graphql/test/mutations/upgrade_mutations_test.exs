defmodule GraphQl.UpgradeMutationsTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "createUpgrade" do
    test "users can manually create upgrades" do
      user  = insert(:user)
      queue = insert(:upgrade_queue, user: user)
      repo  = insert(:repository)

      {:ok, %{data: %{"createUpgrade" => upg}}} = run_query("""
        mutation Create($id: ID!, $queue: String!, $attrs: UpgradeAttributes!) {
          createUpgrade(repositoryId: $id, queue: $queue, attributes: $attrs) {
            id
            repository { id }
            config { paths { path value type } }
          }
        }
      """, %{"id" => repo.id, "queue" => queue.name, "attrs" => %{
        "type" => "CONFIG",
        "message" => "a test upgrade",
        "config" => %{"paths" => [%{"path" => ".some.path", "value" => "hey", "type" => "STRING"}]},
      }}, %{current_user: user})

      assert upg["id"]
      assert upg["repository"]["id"] == repo.id

      [path] = upg["config"]["paths"]
      assert path["path"]  == ".some.path"
      assert path["value"] == "hey"
      assert path["type"]  == "STRING"
    end
  end
end
