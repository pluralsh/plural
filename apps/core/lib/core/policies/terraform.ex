defmodule Core.Policies.Terraform do
  use Piazza.Policy
  alias Core.Schema.{Terraform, User}

  def can?(%User{} = user, %Terraform{} = chart, :access) do
    %{repository: repo} = Core.Repo.preload(chart, repository: :publisher)
    Core.Policies.Repository.can?(user, repo, :access)
  end
  def can?(%User{} = user, %Terraform{} = chart, action) do
    %{repository: %{publisher: publisher}} = Core.Repo.preload(chart, [repository: :publisher])
    Core.Policies.Publisher.can?(user, publisher, action)
  end
  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end