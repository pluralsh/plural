defimpl Email.Deliverable, for: Core.PubSub.ResetTokenCreated do
  def email(%{item: reset}), do: Email.Builder.ResetToken.email(reset)
end
