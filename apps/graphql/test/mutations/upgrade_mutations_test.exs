defmodule GraphQl.Upgrade.MutationsTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "createUpgrade" do
    test "it will create an upgrade for a user" do
      user = insert(:user)
      repo = insert(:repository)
      q    = insert(:upgrade_queue, user: user)
      {:ok, user} = Core.Services.Upgrades.update_default_queue(q, user)

      {:ok, %{data: %{"createUpgrade" => up}}} = run_query("""
        mutation Upgrade($name: String, $attributes: UpgradeAttributes!) {
          createUpgrade(name: $name, attributes: $attributes) {
            id
            message
            repository { id }
          }
        }
      """, %{"name" => repo.name, "attributes" => %{"message" => "hey an upgrade"}}, %{current_user: user})

      assert up["message"] == "hey an upgrade"
      assert up["repository"]["id"] == repo.id
    end
  end
end
