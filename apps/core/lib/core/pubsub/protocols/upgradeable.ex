defprotocol Core.PubSub.Upgradeable do
  @fallback_to_any true
  alias Core.Schema.UpgradeQueue

  @spec derive(struct) :: {%{message: binary, repository: binary}, UpgradeQueue.t} | :ok
  def derive(event)
end

defimpl Core.PubSub.Upgradeable, for: Any do
  def derive(_), do: :ok
end

defimpl Core.PubSub.Upgradeable, for: Core.PubSub.InstallationUpdated do
  def derive(%{item: installation}) do
    %{repository: repo, user: user} =
      Core.Repo.preload(installation, [:repository, [user: :queue]])

    {%{repository_id: repo.id, message: "updated repository configuration"}, [user.queue]}
  end
end

defimpl Core.PubSub.Upgradeable, for: [Core.PubSub.SubscriptionUpdated, Core.PubSub.SubscriptionCreated] do
  alias Core.PubSub

  def derive(%{item: subscription}) do
    %{installation: %{repository: repo, user: user}} =
      Core.Repo.preload(subscription, [installation: [:repository, [user: :queue]]])

    {%{repository_id: repo.id, message: "#{modifier(@for)} repository subscription"}, [user.queue]}
  end

  defp modifier(PubSub.SubscriptionUpdated), do: "updated"
  defp modifier(PubSub.SubscriptionCreated), do: "created"
end
