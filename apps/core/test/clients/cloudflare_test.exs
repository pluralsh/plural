defmodule Core.Clients.CloudflareTest do
  use ExUnit.Case, async: false

  alias Cloudflare.DnsRecord
  alias Core.Clients.Cloudflare, as: Client

  @record %{type: "A", name: "app.example.com", content: "127.0.0.1", ttl: 120}

  @record_json %{
    "type" => "A",
    "name" => "app.example.com",
    "content" => "127.0.0.1",
    "ttl" => 120
  }

  setup {Req.Test, :verify_on_exit!}

  setup do
    Elixir.Cloudflare.Client.init(
      auth_token: "token",
      base_url: "https://api.cloudflare.com/client/v4"
    )
  end

  test "serializes a collection path as an absolute URI path" do
    Req.Test.expect(__MODULE__, fn conn ->
      assert_forwarded(conn, "POST", "/client/v4/zones/zone-id/dns_records", @record_json)
      Req.Test.json(conn, %{"result" => %{}})
    end)

    assert {:ok, %{url: "https://api.cloudflare.com/client/v4/zones/zone-id/dns_records"}} =
             DnsRecord.create(@record,
               params: [zone_id: "zone-id"],
               client: Client,
               plug: {Req.Test, __MODULE__}
             )
  end

  test "serializes record-id paths without a double slash" do
    Req.Test.expect(__MODULE__, fn conn ->
      assert_forwarded(
        conn,
        "PUT",
        "/client/v4/zones/zone-id/dns_records/record-id",
        @record_json
      )
      Req.Test.json(conn, %{"result" => %{}})
    end)

    assert {:ok,
            %{url: "https://api.cloudflare.com/client/v4/zones/zone-id/dns_records/record-id"}} =
             DnsRecord.update("record-id", @record,
               params: [zone_id: "zone-id"],
               client: Client,
               plug: {Req.Test, __MODULE__}
             )

    Req.Test.expect(__MODULE__, fn conn ->
      assert_forwarded(conn, "DELETE", "/client/v4/zones/zone-id/dns_records/record-id")
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
      assert_forwarded(conn, "GET", "/client/v4/zones/zone-id/dns_records")
      refute conn.request_path =~ "//"
      Req.Test.json(conn, %{"result" => %{}})
    end)

    assert {:ok, %{url: "https://api.cloudflare.com/client/v4/zones/zone-id/dns_records"}} =
             Client.get("/zones/zone-id/dns_records", plug: {Req.Test, __MODULE__})
  end

  defp assert_forwarded(conn, method, path, body \\ nil) do
    assert conn.method == method
    assert conn.request_path == path
    assert Plug.Conn.get_req_header(conn, "authorization") == ["Bearer token"]

    if body do
      assert conn.body_params == body
    end
  end
end
