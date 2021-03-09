defprotocol Core.PubSub.Deliverable do
  @fallback_to_any true
  def hooks(event)

  def action(event)

  def payload(event)
end

defimpl Core.PubSub.Deliverable, for: Any do
  def hooks(_), do: :ok

  def action(_), do: :ok

  def payload(_), do: :ok
end

defimpl Core.PubSub.Deliverable, for: [Core.PubSub.IncidentCreated, Core.PubSub.IncidentUpdated] do
  def action(%Core.PubSub.IncidentCreated{}), do: "incident.created"
  def action(_), do: "incident.updated"

  def hooks(%{item: incident}) do
    %{creator: creator, owner: owner} = Core.Repo.preload(incident, [:creator, :owner])

    [creator, owner]
    |> Enum.filter(& &1)
    |> Enum.map(& &1.account_id)
    |> Core.Schema.IntegrationWebhook.for_accounts()
    |> Core.Repo.all()
  end

  def payload(%{item: item}), do: item
end

defimpl Core.PubSub.Deliverable, for: [
                                    Core.PubSub.IncidentMessageCreated,
                                    Core.PubSub.IncidentMessageUpdated,
                                    Core.PubSub.IncidentMessageDeleted
                                ] do
  def action(%Core.PubSub.IncidentMessageCreated{}), do: "incident.message.created"
  def action(%Core.PubSub.IncidentMessageUpdated{}), do: "incident.message.updated"
  def action(_), do: "incident.message.deleted"

  def hooks(%{item: incident}) do
    %{incident: %{creator: creator, owner: owner}} = Core.Repo.preload(incident, [incident: [:creator, :owner]])

    [creator, owner]
    |> Enum.filter(& &1)
    |> Enum.map(& &1.account_id)
    |> Core.Schema.IntegrationWebhook.for_accounts()
    |> Core.Repo.all()
  end

  def payload(%{item: item}), do: item
end
