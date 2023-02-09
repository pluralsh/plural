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
