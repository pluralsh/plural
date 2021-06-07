defmodule Core.Rollable.Utils do
  def repo_id(%{chart: %{repository_id: repo_id}}), do: repo_id
  def repo_id(%{terraform: %{repository_id: repo_id}}), do: repo_id

  def pkg_name(%{chart: %{name: name}}), do: name
  def pkg_name(%{terraform: %{name: name}}), do: name

  def type(%{chart: %{id: _}}), do: "chart"
  def type(_), do: "terraform module"
end
