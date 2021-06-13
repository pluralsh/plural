defprotocol Core.PubSub.Upgradeable do
  @fallback_to_any true
  alias Core.Schema.UpgradeQueue

  @spec derive(struct) :: {%{message: binary, repository: binary}, [UpgradeQueue.t]} | :ok
  def derive(event)
end

defimpl Core.PubSub.Upgradeable, for: Any do
  def derive(_), do: :ok
end

defmodule Core.Upgrades.Utils do
  alias Core.Schema.{UpgradeQueue, User}

  def for_user(%User{id: user_id}), do: for_user(user_id)
  def for_user(user_id) when is_binary(user_id) do
    UpgradeQueue.for_user(user_id)
    |> Core.Repo.all()
  end
end

defimpl Core.PubSub.Upgradeable, for: [Core.PubSub.SubscriptionUpdated, Core.PubSub.SubscriptionCreated] do
  import Core.Upgrades.Utils
  alias Core.PubSub

  def derive(%{item: subscription}) do
    %{installation: %{repository: repo, user: user}} =
      Core.Repo.preload(subscription, [installation: [:repository, :user]])

    {%{repository_id: repo.id, message: "#{modifier(@for)} repository subscription"}, for_user(user)}
  end

  defp modifier(PubSub.SubscriptionUpdated), do: "updated"
  defp modifier(PubSub.SubscriptionCreated), do: "created"
end
