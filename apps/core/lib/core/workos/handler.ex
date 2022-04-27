defprotocol Core.WorkOS.Handler do
  @fallback_to_any true
  def handle(event)
end

defimpl Core.WorkOS.Handler, for: Any do
  def handle(_), do: :ok
end
