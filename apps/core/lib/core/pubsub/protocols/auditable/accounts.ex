defimpl Core.PubSub.Auditable, for: [Core.PubSub.GroupCreated, Core.PubSub.GroupDeleted, Core.PubSub.GroupUpdated] do
  alias Core.Schema.Audit
  alias Core.PubSub

  def audit(%{item: group, actor: %{id: actor_id, account_id: account_id}}) do
    %Audit{
      action: "group:#{action(@for)}",
      actor_id: actor_id,
      account_id: account_id,
      group_id: group.id
    }
  end

  defp action(PubSub.GroupCreated), do: :created
  defp action(PubSub.GroupUpdated), do: :updated
  defp action(PubSub.GroupDeleted), do: :deleted
end

defimpl Core.PubSub.Auditable, for: [Core.PubSub.GroupMemberCreated, Core.PubSub.GroupMemberDeleted] do
  alias Core.Schema.Audit
  alias Core.PubSub

  def audit(%{item: member, actor: %{id: actor_id, account_id: account_id}}) do
    %Audit{
      action: "group:member:#{action(@for)}",
      actor_id: actor_id,
      account_id: account_id,
      group_id: member.group_id
    }
  end

  defp action(PubSub.GroupMemberCreated), do: :created
  defp action(PubSub.GroupMemberDeleted), do: :deleted
end

defimpl Core.PubSub.Auditable, for: [Core.PubSub.RoleCreated, Core.PubSub.RoleDeleted, Core.PubSub.RoleUpdated] do
  alias Core.Schema.Audit
  alias Core.PubSub

  def audit(%{item: role, actor: %{id: actor_id, account_id: account_id}}) do
    %Audit{
      action: "role:#{action(@for)}",
      actor_id: actor_id,
      account_id: account_id,
      role_id: role.id
    }
  end

  defp action(PubSub.RoleCreated), do: :created
  defp action(PubSub.RoleUpdated), do: :updated
  defp action(PubSub.RoleDeleted), do: :deleted
end


defimpl Core.PubSub.Auditable, for: [
                                Core.PubSub.IntegrationWebhookCreated,
                                Core.PubSub.IntegrationWebhookDeleted,
                                Core.PubSub.IntegrationWebhookUpdated
                              ] do
  alias Core.Schema.Audit
  alias Core.PubSub

  def audit(%{item: webhook, actor: %{id: actor_id, account_id: account_id}}) do
    %Audit{
      action: "webhook:#{action(@for)}",
      actor_id: actor_id,
      account_id: account_id,
      integration_webhook_id: webhook.id
    }
  end

  defp action(PubSub.IntegrationWebhookCreated), do: :created
  defp action(PubSub.IntegrationWebhookUpdated), do: :updated
  defp action(PubSub.IntegrationWebhookDeleted), do: :deleted
end

defimpl Core.PubSub.Auditable, for: [Core.PubSub.UserDeleted] do
  alias Core.Schema.Audit

  def audit(%{item: user, actor: %{id: actor_id}}) do
    %Audit{
      action: "user:deleted",
      actor_id: actor_id,
      account_id: user.account_id,
      user_id: user.id
    }
  end
end


defimpl Core.PubSub.Auditable, for: [Core.PubSub.InviteCreated] do
  alias Core.Schema.Audit

  def audit(%{item: invite, actor: %{id: actor_id}}) do
    %Audit{
      action: "invite:created",
      actor_id: actor_id,
      account_id: invite.account_id,
    }
  end
end
