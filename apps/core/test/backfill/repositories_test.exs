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
end
