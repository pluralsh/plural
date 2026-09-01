defmodule Core.PubSub.Fanout.AccessTokenTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.PubSub

  setup do
    Application.ensure_all_started(:swarm)
    :ok
  end

  describe "AccessTokenUsage" do
    test "it can post a message about the meeting" do
      token = insert(:persisted_token)
      ip = "0.0.0.0"
      expect(Core.Buffers.TokenAudit, :submit, fn _, job -> {:ok, job} end)

      ctx = %Core.Schema.AuditContext{ip: ip}
      event = %PubSub.AccessTokenUsage{item: token, context: ctx}
      {:ok, {id, ts, found_ip}} = PubSub.Fanout.fanout(event)

      assert token.id == id
      assert Timex.now()
             |> Timex.set(minute: 0, second: 0, microsecond: {0, 6})
             |> Timex.equal?(ts)
      assert ip == found_ip
    end
  end
end
