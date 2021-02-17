defmodule GraphQl.Resolvers.Incidents do
  use GraphQl.Resolvers.Base, model: Core.Schema.Incident
  alias Core.Services.{Repositories, Incidents}
  alias Core.Schema.{IncidentMessage, Reaction}

  def query(IncidentMessage, _), do: IncidentMessage
  def query(Reaction, _), do: Reaction
  def query(_, _), do: Incident

  def list_incidents(%{repository_id: id} = args, %{context: %{current_user: user}}) do
    Incident.for_repository(id)
    |> Incident.ordered()
    |> maybe_filter_creator(user, supports_repo?(id, user))
    |> paginate(args)
  end

  def list_messages(args, %{source: incident}) do
    IncidentMessage.for_incident(incident.id)
    |> IncidentMessage.ordered()
    |> paginate(args)
  end

  def authorize_incident(%{id: id}, %{context: %{current_user: user}}) do
    Incidents.get_incident!(id)
    |> Core.Policies.Incidents.allow(user, :access)
  end

  def authorize_incidents(repo_id, user) do
    dummy = %Incident{repository_id: repo_id}
    with {:error, _} <- Core.Policies.Incidents.allow(dummy, user, :create),
      do: Core.Policies.Incidents.allow(dummy, user, :accept)
  end

  def create_incident(%{attributes: attrs, repository_id: id}, %{context: %{current_user: user}}),
    do: Incidents.create_incident(attrs, id, user)

  def update_incident(%{attributes: attrs, id: id}, %{context: %{current_user: user}}),
    do: Incidents.update_incident(attrs, id, user)

  def create_message(%{attributes: attrs, incident_id: id}, %{context: %{current_user: user}}),
    do: Incidents.create_message(attrs, id, user)

  def update_message(%{attributes: attrs, id: id}, %{context: %{current_user: user}}),
    do: Incidents.update_message(attrs, id, user)

  def delete_message(%{id: id}, %{context: %{current_user: user}}),
    do: Incidents.delete_message(id, user)

  defp maybe_filter_creator(query, _, true), do: query
  defp maybe_filter_creator(query, %{id: id}, _), do: Incident.for_creator(query, id)

  def supports_repo?(id, user) when is_binary(id) do
    Repositories.get_repository!(id)
    |> Core.Policies.Repository.allow(user, :support)
    |> case do
      {:ok, _} -> true
      _ -> false
    end
  end
end
