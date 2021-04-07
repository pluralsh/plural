defprotocol Email.Deliverable do
  @fallback_to_any true
  def email(event)
end

defimpl Email.Deliverable, for: Any do
  def email(_), do: :ok
end
