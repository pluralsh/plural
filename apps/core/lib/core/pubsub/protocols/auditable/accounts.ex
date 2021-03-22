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
