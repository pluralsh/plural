defmodule Core.Policies.Incidents do
  use Piazza.Policy
  alias Core.Schema.{Incident, IncidentMessage, User}

  @preloads ~w(creator owner)a

  def can?(%User{id: user_id}, %Incident{} = incident, :create) do
    %{repository: repo} = Core.Repo.preload(incident, [:repository])
    if Core.Services.Repositories.get_installation(user_id, repo.id),
          do: :continue, else: {:error, :forbidden}
  end

  def can?(%User{id: owner_id}, %Incident{owner_id: owner_id}, :edit), do: :pass
  def can?(%User{id: creator_id}, %Incident{creator_id: creator_id}, :edit), do: :pass

  def can?(%User{} = user, %Incident{} = incident, :accept) do
    %{repository: repository} = Core.Repo.preload(incident, [repository: [publisher: :account]])
    Core.Policies.Repository.can?(user, repository, :support)
  end

  def can?(%User{account_id: account_id}, %Incident{} = incident, :access) do
    incident = Core.Repo.preload(incident, @preloads)

    Enum.any?(@preloads, fn key ->
      case Map.get(incident, key) do
        %User{account_id: ^account_id} -> true
        _ -> false
      end
    end)
    |> case do
      true -> :pass
      _ -> {:error, :forbidden}
    end
  end

  def can?(user, %IncidentMessage{} = msg, :create) do
    %{incident: incident} = Core.Repo.preload(msg, [incident: @preloads])
    can?(user, incident, :access)
  end

  def can?(%User{id: user_id}, %IncidentMessage{creator_id: user_id}, :edit), do: :pass

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end
