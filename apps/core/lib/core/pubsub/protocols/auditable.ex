defprotocol Core.PubSub.Auditable do
  @fallback_to_any true
  def audit(event)
end

defimpl Core.PubSub.Auditable, for: Any do
  def audit(_), do: :ok
end
