defmodule ApiWeb.WebhookControllerTest do
  use ApiWeb.ConnCase, async: true

  describe "#workos/2" do
    test "it can receive a workos webhook", %{conn: conn} do
      payload = Jason.encode!(%{event: "directory.created", data: %{some: "value"}})
      ts = "102021"

      conn
      |> put_req_header("workos-signature", "t=#{ts}, v1=#{compute_workos_sig(payload, ts)}")
      |> put_req_header("content-type", "application/json")
      |> post("/webhooks/workos", payload)
      |> json_response(200)
    end

    test "invalid signatures are not verified", %{conn: conn} do
      payload = Jason.encode!(%{event: "directory.created", data: %{some: "value"}})
      ts = "102021"

      conn
      |> put_req_header("workos-signature", "t=#{ts}, v1=invalid")
      |> put_req_header("content-type", "application/json")
      |> post("/webhooks/workos", payload)
      |> response(403)
    end
  end

  defp compute_workos_sig(payload, ts) do
    Core.conf(:workos_webhook)
    |> Api.hmac("#{ts}.#{payload}")
  end
end
