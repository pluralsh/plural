defmodule Core.Backfill.RepositoriesTest do
  use Core.SchemaCase, async: true
  alias Core.Backfill.Repositories

  describe "#license_keys/0" do
    test "it will add missing license keys" do
      insts = insert_list(3, :installation, license_key: nil)

      Repositories.license_keys()

      for inst <- insts,
        do: assert is_binary(refetch(inst).license_key)
    end
  end

  describe "#warm_to_stable" do
    test "it can move all warm tags to stable" do
      vts = insert_list(3, :version_tag, tag: "warm")
      ignore = insert(:version_tag, tag: "latest")
      inst = insert(:installation, track_tag: "warm")
      inst2 = insert(:installation, track_tag: "latest")

      Repositories.warm_to_stable()

      for vt <- vts,
        do: assert refetch(vt).tag == "stable"

      assert refetch(ignore).tag == "latest"

      assert refetch(inst).track_tag == "stable"
      assert refetch(inst2).track_tag == "latest"
    end
  end
end
