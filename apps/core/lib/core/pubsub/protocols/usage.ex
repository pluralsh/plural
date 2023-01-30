defprotocol Core.PubSub.Usage do
  @fallback_to_any true

  @type usage_count :: {:user | :cluster, integer}

  @spec update(struct) :: {binary, [usage_count]} | :ok
  def update(event)
end

defimpl Core.PubSub.Usage, for: Any do
  def update(_), do: :ok
end

defimpl Core.PubSub.Usage, for: Core.PubSub.UserCreated do
  def update(%@for{item: %{service_account: true}}), do: :ok
  def update(%@for{item: %{account_id: aid}}), do: {aid, user: 1}
end

defimpl Core.PubSub.Usage, for: Core.PubSub.UserDeleted do
  def update(%@for{item: %{service_account: true}}), do: :ok
  def update(%@for{item: %{account_id: aid}}), do: {aid, user: -1}
end

defimpl Core.PubSub.Usage, for: Core.PubSub.UpgradeQueueCreated do
  def update(%@for{item: queue}) do
    %{user: user} = Core.Repo.preload(queue, [:user])
    {user.account_id, cluster: 1}
  end
end
