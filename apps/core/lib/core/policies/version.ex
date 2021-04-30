defmodule Core.Policies.Version do
  use Piazza.Policy
  alias Core.Policies
  alias Core.Schema.{Chart, Terraform, Version, User}

  @preload [chart: [repository: :publisher], terraform: [repository: :publisher]]

  def can?(%User{} = user, %Version{} = version, action) do
    case Core.Repo.preload(version, @preload) do
      %{chart: %Chart{} = chart} ->
        Policies.Chart.can?(user, chart, action)
      %{terraform: %Terraform{} = terraform} ->
        Policies.Terraform.can?(user, terraform, action)
    end
  end

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end
