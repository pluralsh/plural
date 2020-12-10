defmodule Core.Policies.Terraform do
  use Piazza.Policy
  alias Core.Services.Dependencies
  alias Core.Schema.{Terraform, User, TerraformInstallation}

  def can?(%User{} = user, %Terraform{} = tf, :access) do
    %{repository: repo} = Core.Repo.preload(tf, repository: :publisher)
    Core.Policies.Repository.can?(user, repo, :access)
  end
  def can?(%User{} = user, %Terraform{} = tf, action) do
    %{repository: %{publisher: publisher}} = Core.Repo.preload(tf, [repository: :publisher])
    Core.Policies.Publisher.can?(user, publisher, action)
  end

  def can?(%User{id: user_id} = user, %TerraformInstallation{installation: %{repository_id: repo_id, user_id: user_id}} = ti, :create) do
    case Core.Repo.preload(ti, [:terraform]) do
      %{terraform: %{repository_id: ^repo_id} = terraform} ->
        Dependencies.validate(terraform.dependencies, user)
      _ -> {:error, :forbidden}
    end
  end
  def can?(%User{id: user_id}, %TerraformInstallation{installation: %{user_id: user_id}}, :delete), do: :pass
  def can?(%User{} = user, %TerraformInstallation{installation: %Ecto.Association.NotLoaded{}} = inst, action),
    do: can?(user, Core.Repo.preload(inst, [:installation, :terraform]), action)

  def can?(user, %Ecto.Changeset{} = cs, action),
    do: can?(user, apply_changes(cs), action)

  def can?(_, _, _), do: {:error, :forbidden}
end