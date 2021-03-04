defmodule GraphQl.Resolvers.Incidents do
  use GraphQl.Resolvers.Base, model: Core.Schema.Incident
  alias Core.Services.{Repositories, Incidents}
  alias Core.Schema.{IncidentMessage, Reaction, File, IncidentHistory, Postmortem}

  def data(args) do
    Dataloader.Ecto.new(Core.Repo,
      query: &query/2,
      default_params: filter_context(args),
      run_batch: &run_batch/5
    )
  end

  def query(IncidentMessage, _), do: IncidentMessage
  def query(Reaction, _), do: Reaction
  def query(File, _), do: File
  def query(Postmortem, _), do: Postmortem
  def query(_, _), do: Incident

  def run_batch(_, _, :unread_notifications, [{%{id: user_id}, _} | _] = args, repo_opts) do
    Incident.unread_notification_count(user_id)
    |> aggregated_count(args, repo_opts)
  end

  def run_batch(queryable, query, col, inputs, repo_opts) do
    Dataloader.Ecto.run_batch(Core.Repo, queryable, query, col, inputs, repo_opts)
  end

  def list_incidents(%{repository_id: id} = args, %{context: %{current_user: user}}) do
    Incident.for_repository(id)
    |> incident_sort(args)
    |> maybe_filter_creator(user, supports_repo?(id, user))
    |> maybe_search(Incident, args)
    |> apply_filters(args, user)
    |> paginate(args)
  end

  def list_incidents(args, %{context: %{current_user: user}}) do
    Incident.for_creator(user.id)
    |> maybe_search(Incident, args)
    |> incident_sort(args)
    |> apply_filters(args, user)
    |> paginate(args)
  end

  defp incident_sort(query, %{sort: sort, order: order}) when not is_nil(sort) and not is_nil(order),
    do: Incident.ordered(query, [{order, sort}])
  defp incident_sort(query, _), do: Incident.ordered(query)

  defp apply_filters(query, %{filters: [_ | _] = filters}, user),
    do: Enum.reduce(filters, query, &apply_incident_filter(&2, &1, user))
  defp apply_filters(query, _, _), do: query

  defp apply_incident_filter(query, %{type: :following}, user), do: Incident.following(query, user.id)
  defp apply_incident_filter(query, %{type: :notifications}, user), do: Incident.with_notifications(query, user.id)
  defp apply_incident_filter(query, %{type: :tag, value: tag}, _), do: Incident.for_tag(query, tag)

  def list_messages(args, %{source: incident}) do
    IncidentMessage.for_incident(incident.id)
    |> IncidentMessage.ordered()
    |> paginate(args)
  end

  def list_files(args, %{source: incident}) do
    File.for_incident(incident.id)
    |> File.ordered()
    |> paginate(args)
  end

  def list_history(args, %{source: incident}) do
    IncidentHistory.for_incident(incident.id)
    |> IncidentHistory.ordered()
    |> paginate(args)
  end

  def resolve_follower(_, %{source: %{id: incident_id}, context: %{current_user: user}}) do
    {:ok, Incidents.get_follower(user.id, incident_id)}
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

  def accept_incident(%{id: id}, %{context: %{current_user: user}}),
    do: Incidents.accept_incident(id, user)

  def complete_incident(%{postmortem: attrs, id: id}, %{context: %{current_user: user}}),
    do: Incidents.complete_incident(attrs, id, user)

  def create_message(%{attributes: attrs, incident_id: id}, %{context: %{current_user: user}}),
    do: Incidents.create_message(attrs, id, user)

  def update_message(%{attributes: attrs, id: id}, %{context: %{current_user: user}}),
    do: Incidents.update_message(attrs, id, user)

  def delete_message(%{id: id}, %{context: %{current_user: user}}),
    do: Incidents.delete_message(id, user)

  def create_reaction(%{message_id: id, name: name}, %{context: %{current_user: user}}),
    do: Incidents.create_reaction(id, name, user)

  def delete_reaction(%{message_id: id, name: name}, %{context: %{current_user: user}}),
    do: Incidents.delete_reaction(id, name, user)

  def follow_incident(%{attributes: attrs, id: id}, %{context: %{current_user: user}}),
    do: Incidents.follow_incident(attrs, id, user)

  def unfollow_incident(%{id: id}, %{context: %{current_user: user}}),
    do: Incidents.unfollow_incident(id, user)

  defp aggregated_count(query, args, repo_opts) do
    conv_ids = Enum.map(args, fn
      %{id: id} -> id
      {_, %{id: id}} -> id
    end)

    result =
      query
      |> Incident.for_ids(conv_ids)
      |> Core.Repo.all(repo_opts)
      |> Map.new()

    Enum.map(conv_ids, & [Map.get(result, &1, 0)])
  end

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
