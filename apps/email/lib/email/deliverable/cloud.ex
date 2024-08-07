defimpl Email.Deliverable, for: Core.PubSub.ConsoleInstanceReaped do
  def email(%{item: inst}), do: Email.Builder.ConsoleReaped.email(inst)
end
