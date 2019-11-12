defmodule Core.Services.Terraform do
  use Core.Services.Base
  import Core.Policies.Terraform
  alias Core.Services.Repositories
  alias Core.Schema.{Terraform, TerraformInstallation, User}

  def get_tf!(id), do: Core.Repo.get!(Terraform, id)

  def get_terraform_by_name(repo_id, name),
    do: Core.Repo.get_by(Terraform, repository_id: repo_id, name: name)

  def get_terraform_installation(terraform_id, user_id) do
    TerraformInstallation.for_terraform(terraform_id)
    |> TerraformInstallation.for_user(user_id)
    |> Core.Repo.one()
  end

  def create_terraform(attrs, repo_id, user) do
    with {:ok, added} <- extract_tf_meta(attrs) do
      %Terraform{repository_id: repo_id}
      |> Terraform.changeset(Map.merge(attrs, added))
      |> allow(user, :create)
      |> when_ok(:insert)
    end
  end

  def upsert_terraform(attrs, repo_id, name, user) do
    case get_terraform_by_name(repo_id, name) do
      %Terraform{id: id} -> update_terraform(attrs, id, user)
      _ -> create_terraform(attrs, repo_id, user)
    end
  end

  def update_terraform(attrs, id, user) do
    with {:ok, added} <- extract_tf_meta(attrs) do
      get_tf!(id)
      |> Terraform.changeset(Map.merge(attrs, added))
      |> allow(user, :edit)
      |> when_ok(:update)
    end
  end

  def create_terraform_installation(attrs, installation_id, %User{} = user) do
    installation = Repositories.get_installation!(installation_id)

    %TerraformInstallation{installation_id: installation.id, installation: installation}
    |> TerraformInstallation.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
  end

  def update_terraform_installation(attrs, tf_inst_id, %User{} = user) do
    Core.Repo.get!(TerraformInstallation, tf_inst_id)
    |> Core.Repo.preload([:installation, :terraform])
    |> TerraformInstallation.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:update)
  end

  def delete_terraform_installation(tf_inst_id, %User{} = user) do
    Core.Repo.get!(TerraformInstallation, tf_inst_id)
    |> Core.Repo.preload([:installation, :terraform])
    |> allow(user, :create)
    |> when_ok(:delete)
  end

  def extract_tf_meta(%{package: %{path: path, filename: file}}) do
    root = grab_root_dir(file)
    path = String.to_charlist(path)
    [rm, valt] = files = ["#{root}/README.md", "#{root}/terraform.tfvars"]
                         |> Enum.map(&String.to_charlist/1)

    with {:ok, result} <- :erl_tar.extract(path, [:memory, :compressed, {:files, files}]) do
      {:ok, %{
        readme: extract_tar_file(result, rm),
        values_template: extract_tar_file(result, valt)
      }}
    end
  end
  def extract_tf_meta(_), do: {:ok, %{}}

  def extract_tar_file(result, val_template) do
    case Enum.find(result, &elem(&1, 0) == val_template) do
      {_, template} -> template
      _ -> nil
    end
  end

  def grab_root_dir(filename) do
    Path.rootname(filename)
    |> Path.basename()
  end
end