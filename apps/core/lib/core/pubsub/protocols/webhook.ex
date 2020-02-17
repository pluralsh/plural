defprotocol Core.PubSub.Webhook do
  @fallback_to_any true
  alias Core.Schema.Webhook

  @spec derive(struct) :: {%{message: binary, repository: binary}, Webhook.t} | :ok
  def derive(event)
end

defimpl Core.PubSub.Webhook, for: Any do
  def derive(_), do: :ok
end

defimpl Core.PubSub.Webhook, for: Core.PubSub.InstallationUpdated do
  def derive(%{item: installation}) do
    %{repository: repo, user: user} =
      Core.Repo.preload(installation, [:repository, [user: :webhooks]])

    {%{repository: repo.name, message: "updated repository configuration"}, user.webhooks}
  end
end

defimpl Core.PubSub.Webhook, for: [Core.PubSub.SubscriptionUpdated, Core.PubSub.SubscriptionCreated] do
  alias Core.PubSub

  def derive(%{item: subscription}) do
    %{installation: %{repository: repo, user: user}} =
      Core.Repo.preload(subscription, [installation: [:repository, [user: :webhooks]]])

    {%{repository: repo.name, message: "#{modifier(@for)} repository subscription"}, user.webhooks}
  end

  defp modifier(PubSub.SubscriptionUpdated), do: "updated"
  defp modifier(PubSub.SubscriptionCreated), do: "created"
end