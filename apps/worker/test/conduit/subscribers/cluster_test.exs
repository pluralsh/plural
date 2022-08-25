defmodule Worker.Conduit.Subscribers.ClusterTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Worker.Conduit.Subscribers.Cluster
  alias Cloudflare.DnsRecord

  describe "#destroy/1" do
    test "it can destroy a dns record" do
      record = insert(:dns_record)
      expect(DnsRecord, :delete, fn _, _ -> dns_resp("ext-id") end)

      {:ok, _} = Cluster.destroy(record)

      refute refetch(record)
    end
  end

  defp dns_resp(external_id) do
    {:ok, %Tesla.Env{body: %{"result" => %{"id" => external_id}}}}
  end
end
