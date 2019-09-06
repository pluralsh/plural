defmodule Core.Policies.Chart do
  use Core.Policies.Base
  alias Core.Schema.{Chart, Version, User, Installation}
  alias Core.Services.Charts

  def can?(%User{} = user, %Chart{} = chart, action) do
    %{publisher: publisher} = Core.Repo.preload(chart, [:publisher])
    Core.Policies.Publisher.can?(user, publisher, action)
  end
  def can?(%User{} = user, %Version{} = chart_version, action) do
    %{chart: chart} = Core.Repo.preload(chart_version, [chart: :publisher])
    can?(user, chart, action)
  end
  def can?(%User{}, %Installation{chart_id: chart_id, version: v}, :create) do
    case Charts.get_chart_version(chart_id, v) do
      nil -> {:error, :no_version}
      _ -> :continue
    end
  end

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end