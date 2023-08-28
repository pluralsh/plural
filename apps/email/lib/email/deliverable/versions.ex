defimpl Email.Deliverable, for: Core.PubSub.InstallationLocked do
  def email(%{item: inst}), do: Email.Builder.LockedInstallation.email(inst)
end

defimpl Email.Deliverable, for: Core.PubSub.DeferredUpdateCreated do
  def email(%{item: %{pending: true} = update}), do: Email.Builder.PendingPromotion.email(update)
  def email(_), do: :ok
end
