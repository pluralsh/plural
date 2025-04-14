defmodule Core.MCP.Tools.CloudReapTest do
  use Core.SchemaCase, async: true
  alias Core.MCP.Tools.CloudReap

  describe "invoke/1" do
    test "it will initiate the reaping process for a cloud cluster" do
      inst = insert(:console_instance)

      {:ok, res} = CloudReap.invoke(%{"name" => inst.name})

      assert is_binary(res)

      assert refetch(inst).first_notif_at
      refute refetch(inst).second_notif_at
    end
  end
end
