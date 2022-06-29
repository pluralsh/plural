defmodule Core.Backfill.HydraTest do
  use Core.SchemaCase, async: true
  alias Core.Backfill.Hydra
  use Mimic

  describe "#license_keys/0" do
    test "it will add missing license keys" do
      insts = insert_list(3, :installation)
      for inst <- insts,
        do: insert(:oidc_provider, installation: inst)

      expect(HTTPoison, :put, 3, fn _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{client_id: "123", client_secret: "secret"})}}
      end)

      Hydra.providers()

      for inst <- insts,
        do: assert is_binary(refetch(inst).license_key)
    end
  end
end
