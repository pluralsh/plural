defimpl Email.Deliverable, for: Core.PubSub.ResetTokenCreated do
  def email(%{item: reset}), do: Email.Builder.ResetToken.email(reset)
end

defimpl Email.Deliverable, for: Core.PubSub.PasswordlessLoginCreated do
  def email(%{item: login}), do: Email.Builder.PasswordlessLogin.email(login)
end

defimpl Email.Deliverable, for: Core.PubSub.InviteCreated do
  def email(%{item: %{user_id: id} = invite}) when is_binary(id), do: Email.Builder.Invite.email(invite)
  def email(_), do: :ok
end
