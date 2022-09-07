defprotocol Core.PubSub.Cacheable do
  @fallback_to_any true
  def cache(event)
end

defimpl Core.PubSub.Cacheable, for: Any do
  def cache(_), do: :ok
end

defimpl Core.PubSub.Cacheable, for: [Core.PubSub.GroupMemberCreated, Core.PubSub.GroupMemberDeleted] do
  def cache(%{item: member}) do
    %{user: user} = Core.Repo.preload(member, [:user])
    user = Core.Services.Rbac.preload(user)
    {:set, {:login, user.id}, user}
  end
end

defimpl Core.PubSub.Cacheable, for: [Core.PubSub.UserUpdated, Core.PubSub.EmailConfirmed, Core.PubSub.CacheUser] do
  def cache(%{item: user}) do
    user = Core.Services.Rbac.preload(user)
    {:set, {:login, user.id}, user}
  end
end

defimpl Core.PubSub.Cacheable, for: Core.PubSub.UserDeleted do
  def cache(%{item: %{id: user_id}}), do: {:del, {:login, user_id}, nil}
end

defimpl Core.PubSub.Cacheable, for: [Core.PubSub.InstallationCreated, Core.PubSub.InstallationDeleted] do
  def cache(%{item: %{user_id: user_id}}),
    do: {:del, {:has_installations, user_id}, nil}
end
