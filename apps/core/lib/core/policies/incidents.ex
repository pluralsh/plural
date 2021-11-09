defmodule Core.Policies.Incidents do
  use Piazza.Policy
  alias Core.Schema.{Incident, IncidentMessage, User, Follower}

  @preloads ~w(creator owner)a

  def can?(%User{id: user_id}, %Incident{repository_id: repo_id}, :create) do
    if Core.Services.Repositories.get_installation(user_id, repo_id),
        do: :continue, else: {:error, :forbidden}
  end

  def can?(%User{id: owner_id}, %Incident{owner_id: owner_id}, :edit), do: :pass
  def can?(%User{id: creator_id}, %Incident{creator_id: creator_id}, :edit), do: :pass

  def can?(%User{} = user, %Incident{} = incident, :accept) do
    %{repository: repository} = Core.Repo.preload(incident, [repository: [publisher: :account]])
    Core.Policies.Repository.can?(user, repository, :support)
  end

  def can?(%User{} = user, %Incident{} = incident, :complete),
    do: can?(user, incident, :accept)

  def can?(%User{id: user_id} = user, %Follower{user_id: user_id} = f, _) do
    %{incident: incident} = Core.Repo.preload(f, [:incident])
    can?(user, incident, :access)
  end

  def can?(%User{account_id: account_id} = user, %Incident{} = incident, :access) do
    incident = Core.Repo.preload(incident, @preloads)

    Enum.any?(@preloads, fn key ->
      case Map.get(incident, key) do
        %User{account_id: ^account_id} -> true
        _ -> false
      end
    end)
    |> case do
      true -> :pass
      _ -> can?(user, incident, :accept)
    end
  end

  def can?(user, %IncidentMessage{} = msg, action) when action in [:create, :react] do
    %{incident: incident} = Core.Repo.preload(msg, [incident: @preloads])
    can?(user, incident, :access)
  end

  def can?(%User{id: user_id}, %IncidentMessage{creator_id: user_id}, :edit), do: :pass

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end
