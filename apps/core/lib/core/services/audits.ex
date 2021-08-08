defmodule Core.Services.Audits do
  alias Core.Schema.AuditContext

  @context_key :audit_context

  def set_context(%AuditContext{} = ctx),
    do: Process.put(@context_key, ctx)

  def context(), do: Process.get(@context_key)
end
