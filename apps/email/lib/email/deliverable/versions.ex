defimpl Email.Deliverable, for: Core.PubSub.InstallationLocked do
  def email(%{item: inst}), do: Email.Builder.LockedInstallation.email(inst)
end
