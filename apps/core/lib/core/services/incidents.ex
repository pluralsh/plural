defmodule Core.Services.Incidents do
  use Core.Services.Base
  import Core.Policies.Incidents
  alias Core.Schema.{User, Incident, IncidentMessage, Reaction, IncidentHistory, Follower}
  alias Core.PubSub

  def get_incident!(id), do: Core.Repo.get!(Incident, id)

  def get_message!(id), do: Core.Repo.get!(IncidentMessage, id)

  def get_follower(user_id, incident_id),
    do: Core.Repo.get_by(Follower, user_id: user_id, incident_id: incident_id)

  def get_follower!(user_id, incident_id),
    do: Core.Repo.get_by!(Follower, user_id: user_id, incident_id: incident_id)

  def create_incident(attrs, repository_id, %User{} = user) do
    start_transaction()
    |> add_operation(:change, fn _ ->
      %Incident{repository_id: repository_id, creator_id: user.id, status: :open}
      |> Incident.changeset(attrs)
      |> allow(user, :create)
    end)
    |> add_operation(:insert, fn %{change: change} -> Core.Repo.insert(change) end)
    |> add_operation(:hist, fn %{change: change, insert: %{id: id}} ->
      %IncidentHistory{incident_id: id, actor_id: user.id}
      |> IncidentHistory.changeset(%{action: :create}, change)
      |> Core.Repo.insert()
    end)
    |> execute(extract: :insert)
    |> notify(:create)
  end

  def update_incident(attrs, incident_id, %User{} = user) do
    start_transaction()
    |> add_operation(:change, fn _ ->
      get_incident!(incident_id)
      |> Core.Repo.preload([:tags, :cluster_information])
      |> Incident.changeset(attrs)
      |> allow(user, :edit)
    end)
    |> add_operation(:update, fn %{change: change} -> Core.Repo.update(change) end)
    |> add_operation(:hist, fn %{change: change, update: %{id: id}} ->
      %IncidentHistory{incident_id: id, actor_id: user.id}
      |> IncidentHistory.changeset(change)
      |> Core.Repo.insert()
    end)
    |> execute(extract: :update)
    |> notify(:update, user)
  end

  def accept_incident(incident_id, %User{} = user) do
    start_transaction()
    |> add_operation(:change, fn _ ->
      get_incident!(incident_id)
      |> Incident.changeset(%{owner_id: user.id, status: :in_progress})
      |> allow(user, :accept)
    end)
    |> add_operation(:update, fn %{change: change} -> Core.Repo.update(change) end)
    |> add_operation(:hist, fn %{change: change, update: %{id: id}} ->
      %IncidentHistory{incident_id: id, actor_id: user.id}
      |> IncidentHistory.changeset(%{action: :accept}, change)
      |> Core.Repo.insert()
    end)
    |> execute(extract: :update)
    |> notify(:update, user)
  end

  def complete_incident(attrs, incident_id, %User{} = user) do
    attrs = Map.put(attrs, :creator_id, user.id)
    start_transaction()
    |> add_operation(:change, fn _ ->
      get_incident!(incident_id)
      |> Core.Repo.preload([:postmortem])
      |> Incident.complete_changeset(%{status: :complete, postmortem: attrs})
      |> allow(user, :complete)
    end)
    |> add_operation(:update, fn %{change: change} -> Core.Repo.update(change) end)
    |> add_operation(:hist, fn %{change: change, update: %{id: id}} ->
      %IncidentHistory{incident_id: id, actor_id: user.id}
      |> IncidentHistory.changeset(%{action: :complete}, change)
      |> Core.Repo.insert()
    end)
    |> execute(extract: :update)
    |> notify(:update, user)
  end

  def follow_incident(attrs, incident_id, %User{id: user_id} = user) do
    case Core.Repo.get_by(Follower, user_id: user_id, incident_id: incident_id) do
      %Follower{} = f -> f
      nil -> %Follower{incident_id: incident_id, user_id: user_id}
    end
    |> Follower.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(&Core.Repo.insert_or_update/1)
  end

  def unfollow_incident(incident_id, %User{id: user_id}) do
    get_follower!(user_id, incident_id)
    |> Core.Repo.delete()
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
    |> Core.Repo.preload([:entities])
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

  def create_reaction(message_id, name, %User{} = user) do
    start_transaction()
    |> add_operation(:allow, fn _ ->
      get_message!(message_id)
      |> allow(user, :react)
    end)
    |> add_operation(:create, fn %{allow: %{id: id}} ->
      %Reaction{message_id: id, creator_id: user.id}
      |> Reaction.changeset(%{name: name})
      |> Core.Repo.insert()
    end)
    |> execute(extract: :allow)
    |> notify(:update)
  end

  def delete_reaction(message_id, name, %User{id: user_id}) do
    start_transaction()
    |> add_operation(:delete, fn _ ->
      Core.Repo.get_by!(Reaction, message_id: message_id, name: name, creator_id: user_id)
      |> Core.Repo.delete()
    end)
    |> add_operation(:allow, fn _ -> {:ok, get_message!(message_id)} end)
    |> execute(extract: :allow)
    |> notify(:update)
  end

  defp notify({:ok, %Incident{} = inc}, :create),
    do: handle_notify(PubSub.IncidentCreated, inc)
  defp notify({:ok, %IncidentMessage{} = msg}, :update),
    do: handle_notify(PubSub.IncidentMessageUpdated, msg)
  defp notify({:ok, %IncidentMessage{} = msg}, :create),
    do: handle_notify(PubSub.IncidentMessageCreated, msg)
  defp notify({:ok, %IncidentMessage{} = msg}, :delete),
    do: handle_notify(PubSub.IncidentMessageDeleted, msg)

  defp notify(pass, _), do: pass

  defp notify({:ok, %Incident{} = msg}, :update, user),
    do: handle_notify(PubSub.IncidentUpdated, msg, actor: user)

  defp notify(pass, _, _), do: pass
end
