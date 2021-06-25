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
      erl_ip = {0, 0, 0, 0}
      expect(Core.Buffers.TokenAudit, :submit, fn _, job -> {:ok, job} end)

      event = %PubSub.AccessTokenUsage{item: token, context: erl_ip}
      {:ok, {id, ts, ip}} = PubSub.Fanout.fanout(event)

      assert token.id == id
      assert Timex.now()
             |> Timex.set(minutes: 0, seconds: 0, millisecond: {0, 6})
             |> Timex.equal?(ts)
      assert ip == :inet.ntoa(erl_ip)
    end
  end
end
