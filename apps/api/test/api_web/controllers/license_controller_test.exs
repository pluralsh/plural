defmodule ApiWeb.LicenseControllerTest do
  use ApiWeb.ConnCase, async: true

  describe "#get/2" do
    test "it can fetch an installation's license", %{conn: conn} do
      inst = insert(:installation)

      res =
        get(conn, "/api/license/#{inst.license_key}")
        |> json_response(200)

      assert res["policy"]["free"]

      assert_receive {:event, %Core.PubSub.LicensePing{item: %{id: id}}}
      assert id == inst.id
    end
  end
end
