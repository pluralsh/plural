defmodule Core.Clients.CloudflareTest do
  use ExUnit.Case, async: false

  alias Cloudflare.DnsRecord
  alias Core.Clients.Cloudflare, as: Client

  setup {Req.Test, :verify_on_exit!}

  setup do
    Elixir.Cloudflare.Client.init(
      auth_token: "token",
      base_url: "https://api.cloudflare.com/client/v4"
    )
  end

  test "serializes a collection path as an absolute URI path" do
    Req.Test.expect(__MODULE__, fn conn ->
      assert conn.method == "POST"
      assert conn.request_path == "/client/v4/zones/zone-id/dns_records"
      Req.Test.json(conn, %{"result" => %{}})
    end)

    assert {:ok, %{url: "https://api.cloudflare.com/client/v4/zones/zone-id/dns_records"}} =
             DnsRecord.create(%{},
               params: [zone_id: "zone-id"],
               client: Client,
               plug: {Req.Test, __MODULE__}
             )
  end

  test "serializes record-id paths without a double slash" do
    Req.Test.expect(__MODULE__, fn conn ->
      assert conn.method == "PUT"
      assert conn.request_path == "/client/v4/zones/zone-id/dns_records/record-id"
      Req.Test.json(conn, %{"result" => %{}})
    end)

    assert {:ok,
            %{url: "https://api.cloudflare.com/client/v4/zones/zone-id/dns_records/record-id"}} =
             DnsRecord.update("record-id", %{},
               params: [zone_id: "zone-id"],
               client: Client,
               plug: {Req.Test, __MODULE__}
             )

    Req.Test.expect(__MODULE__, fn conn ->
      assert conn.method == "DELETE"
      assert conn.request_path == "/client/v4/zones/zone-id/dns_records/record-id"
      Req.Test.json(conn, %{"result" => %{}})
    end)

    assert {:ok,
            %{url: "https://api.cloudflare.com/client/v4/zones/zone-id/dns_records/record-id"}} =
             DnsRecord.delete("record-id",
               params: [zone_id: "zone-id"],
               client: Client,
               plug: {Req.Test, __MODULE__}
             )
  end

  test "normalizes a slash-prefixed path" do
    Req.Test.expect(__MODULE__, fn conn ->
      assert conn.request_path == "/client/v4/zones/zone-id/dns_records"
      refute conn.request_path =~ "//"
      Req.Test.json(conn, %{"result" => %{}})
    end)

    assert {:ok, %{url: "https://api.cloudflare.com/client/v4/zones/zone-id/dns_records"}} =
             Client.get("/zones/zone-id/dns_records", plug: {Req.Test, __MODULE__})
  end
end
