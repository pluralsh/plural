defmodule Core.Policies.Chart do
  use Piazza.Policy
  alias Core.Services.{Dependencies}
  alias Core.Schema.{Chart, Version, User, ChartInstallation, Crd}

  def can?(%User{} = user, %Chart{} = chart, :access) do
    %{repository: repo} = Core.Repo.preload(chart, repository: :publisher)
    Core.Policies.Repository.can?(user, repo, :access)
  end

  def can?(%User{} = user, %Chart{} = chart, action) do
    %{repository: %{publisher: publisher}} = Core.Repo.preload(chart, [repository: :publisher])
    Core.Policies.Publisher.can?(user, publisher, action)
  end

  def can?(%User{} = user, %Version{} = chart_version, action) do
    %{chart: chart} = Core.Repo.preload(chart_version, [chart: [repository: :publisher]])
    can?(user, chart, action)
  end

  def can?(%User{} = user, %Crd{} = crd, action) do
    %{version: v} = Core.Repo.preload(crd, [version: [chart: [repository: :publisher]]])
    can?(user, v, action)
  end

  def can?(
    %User{id: user_id} = user,
    %ChartInstallation{installation: %{repository_id: repo_id, user_id: user_id}} = ci,
    :create
  ) do
    case Core.Repo.preload(ci, [:chart, :version]) do
      %{version: %{chart_id: cid} = version, chart: %{id: cid, repository_id: ^repo_id}} ->
        Dependencies.validate(version.dependencies, user)
      _ -> {:error, :invalid_version}
    end
  end
  def can?(%User{id: user_id}, %ChartInstallation{installation: %{user_id: user_id}}, _), do: :pass
  def can?(%User{} = user, %ChartInstallation{installation: %Ecto.Association.NotLoaded{}} = inst, action),
    do: can?(user, Core.Repo.preload(inst, [:installation, :chart, :version]), action)

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end