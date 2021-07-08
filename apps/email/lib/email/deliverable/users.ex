defimpl Email.Deliverable, for: Core.PubSub.ResetTokenCreated do
  def email(%{item: reset}), do: Email.Builder.ResetToken.email(reset)
end

defimpl Email.Deliverable, for: Core.PubSub.PasswordlessLoginCreated do
  def email(%{item: login}), do: Email.Builder.PasswordlessLogin.email(login)
end
