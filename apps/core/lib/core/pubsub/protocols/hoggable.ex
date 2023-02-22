defprotocol Core.PubSub.Hoggable do
  @fallback_to_any true

  def hog(event)
end

defimpl Core.PubSub.Hoggable, for: Any do
  def hog(_), do: :ok
end

defimpl Core.PubSub.Hoggable, for: [Core.PubSub.InstallationCreated, Core.PubSub.InstallationDeleted] do
  alias Core.PubSub

  def hog(%{item: inst}) do
    inst = Core.Repo.preload(inst, [:repository])
    {event(@for), inst.user_id, %{applicationID: inst.repository_id, applicationName: inst.repository.name}}
  end

  defp event(PubSub.InstallationCreated), do: "installation.created"
  defp event(PubSub.InstallationDeleted), do: "installation.deleted"
end

defimpl Core.PubSub.Hoggable, for: Core.PubSub.UserCreated do
  def hog(%{item: user}), do: {"user.created", user.id, %{}}
end

defimpl Core.PubSub.Hoggable, for: [Core.PubSub.DemoProjectCreated, Core.PubSub.DemoProjectDeleted] do
  alias Core.PubSub
  alias Core.Schema.DemoProject

  def hog(%{item: %DemoProject{user_id: user_id}}) do
    {event(@for), user_id, %{}}
  end

  defp event(PubSub.DemoProjectCreated), do: "demo.created"
  defp event(PubSub.DemoProjectDeleted), do: "demo.deleted"
end
