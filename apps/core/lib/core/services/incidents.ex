defmodule Core.Services.Incidents do
  use Core.Services.Base
  import Core.Policies.Incidents
  alias Core.Schema.{User, Incident, IncidentMessage}
  alias Core.PubSub

  def get_incident!(id), do: Core.Repo.get!(Incident, id)

  def get_message!(id), do: Core.Repo.get!(IncidentMessage, id)

  def create_incident(attrs, repository_id, %User{} = user) do
    %Incident{repository_id: repository_id, creator_id: user.id, status: :open}
    |> Incident.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
    |> notify(:create)
  end

  def update_incident(attrs, incident_id, %User{} = user) do
    get_incident!(incident_id)
    |> Incident.changeset(attrs)
    |> allow(user, :edit)
    |> when_ok(:update)
    |> notify(:update)
  end

  def accept_incident(incident_id, %User{} = user) do
    get_incident!(incident_id)
    |> Incident.changeset(%{owner_id: user.id, status: :in_progress})
    |> allow(user, :accept)
    |> when_ok(:update)
    |> notify(:update)
  end

  def create_message(attrs, incident_id, %User{} = user) do
    %IncidentMessage{creator_id: user.id, incident_id: incident_id}
    |> IncidentMessage.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
    |> notify(:create)
  end

  def update_message(attrs, message_id, %User{} = user) do
    get_message!(message_id)
    |> IncidentMessage.changeset(attrs)
    |> allow(user, :edit)
    |> when_ok(:update)
    |> notify(:update)
  end

  def delete_message(message_id, %User{} = user) do
    get_message!(message_id)
    |> allow(user, :edit)
    |> when_ok(:delete)
    |> notify(:delete)
  end

  defp notify({:ok, %Incident{} = inc}, :create),
    do: handle_notify(PubSub.IncidentCreated, inc)
  defp notify({:ok, %Incident{} = inc}, :update),
    do: handle_notify(PubSub.IncidentUpdated, inc)

  defp notify({:ok, %IncidentMessage{} = msg}, :create),
    do: handle_notify(PubSub.IncidentMessageCreated, msg)
  defp notify({:ok, %IncidentMessage{} = msg}, :update),
    do: handle_notify(PubSub.IncidentMessageUpdated, msg)
  defp notify({:ok, %IncidentMessage{} = msg}, :delete),
    do: handle_notify(PubSub.IncidentMessageDeleted, msg)

  defp notify(passthrough, _), do: passthrough
end
