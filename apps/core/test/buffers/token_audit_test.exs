defmodule Core.Buffers.TokenAuditTest do
  use Core.SchemaCase, async: false
  alias Core.Buffers.TokenAudit

  describe "Core.Buffers.TokenAudit" do
    test "it will collect token audits and aggregate conuts" do
      tok = insert(:persisted_token)
      now = Timex.now()
      ip = '1.2.3.4'

      {:ok, pid} = TokenAudit.start()
      Process.monitor(pid)
      TokenAudit.submit(pid, {tok.id, now, ip})
      TokenAudit.submit(pid, {tok.id, now, ip})
      send(pid, :flush)

      assert_receive {:DOWN, _, :process, ^pid, _}

      [audit] = Core.Repo.all(Core.Schema.AccessTokenAudit)

      assert audit.ip == "#{ip}"
      assert audit.token_id == tok.id
      assert audit.timestamp == now
      assert audit.count == 2
    end
  end
end
