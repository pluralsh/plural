defimpl Core.WorkOS.Handler, for: Core.WorkOS.Events.DSyncActivated do
  alias Core.WorkOS.Resources
  def handle(%@for{domains: domains, id: id}), do: Resources.create_directory(id, domains)
end

defimpl Core.WorkOS.Handler, for: Core.WorkOS.Events.DSyncDeactivated do
  def handle(_), do: :ok
end

defimpl Core.WorkOS.Handler, for: Core.WorkOS.Events.DSyncDeleted do
  alias Core.WorkOS.Resources
  def handle(%@for{id: id}), do: Resources.delete_directory(id)
end
