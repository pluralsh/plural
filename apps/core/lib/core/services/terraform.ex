defmodule Core.Services.Terraform do
  use Core.Services.Base
  import Core.Policies.Terraform
  alias Core.Services.{Repositories, Dependencies, Versions}
  alias Core.Schema.{Terraform, TerraformInstallation, User}

  @type terraform_installation_resp :: {:ok, TerraformInstallation.t} | {:error, term}

  @spec get_tf!(binary) :: Terraform.t
  def get_tf!(id), do: Core.Repo.get!(Terraform, id)

  @spec get_tf(binary) :: Terraform.t | nil
  def get_tf(id), do: Core.Repo.get(Terraform, id)

  @spec get_latest_version(binary) :: Version.t | nil
  def get_latest_version(tf_id) do
    with %Terraform{latest_version: version} <- get_tf(tf_id),
      do: Versions.get_version(:terraform, tf_id, version)
  end

  @spec get_terraform_by_name(binary, binary) :: Terraform.t | nil
  def get_terraform_by_name(repo_id, name),
    do: Core.Repo.get_by(Terraform, repository_id: repo_id, name: name)

  @spec get_terraform_by_name!(binary, binary) :: Terraform.t
  def get_terraform_by_name!(repo_id, name),
    do: Core.Repo.get_by!(Terraform, repository_id: repo_id, name: name)

  @spec get_terraform_installation(binary, binary) :: TerraformInstallation.t | nil
  def get_terraform_installation(terraform_id, user_id) do
    TerraformInstallation.for_terraform(terraform_id)
    |> TerraformInstallation.for_user(user_id)
    |> Core.Repo.one()
  end

  @doc """
  Creates a new terraform module for the repository.  Fails if the user is not
  the publisher of the parent repository.
  """
  @spec create_terraform(map, binary, User.t) :: {:ok, Terraform.t} | {:error, term}
  def create_terraform(attrs, repo_id, user) do
    with {:ok, added} <- extract_tf_meta(attrs) do
      start_transaction()
      |> add_operation(:terraform, fn _ ->
        %Terraform{repository_id: repo_id}
        |> Terraform.changeset(Map.merge(attrs, added))
        |> allow(user, :create)
        |> when_ok(:insert)
      end)
      |> add_operation(:version, fn
        %{terraform: %Terraform{id: id, latest_version: v}} when not is_nil(v) ->
          attrs
          |> Map.merge(added)
          |> Map.put(:version, v)
          |> Versions.create_version(:terraform, id, user)
        _ -> {:ok, nil}
      end)
      |> execute(extract: :terraform)
    end
  end

  @doc "Self-explanatory"
  @spec upsert_terraform(map, binary, binary, User.t) :: {:ok, Terraform.t} | {:error, term}
  def upsert_terraform(attrs, repo_id, name, user) do
    case get_terraform_by_name(repo_id, name) do
      %Terraform{id: id} -> update_terraform(attrs, id, user)
      _ -> create_terraform(attrs, repo_id, user)
    end
  end

  @doc """
  Updates a terraform module. Fails if the user is not the publisher
  """
  @spec update_terraform(map, binary, User.t) :: {:ok, Terraform.t} | {:error, term}
  def update_terraform(attrs, id, user) do
    with {:ok, added} <- extract_tf_meta(attrs) do
      start_transaction()
      |> add_operation(:terraform, fn _ ->
        get_tf!(id)
        |> Terraform.changeset(Map.merge(attrs, added))
        |> allow(user, :edit)
        |> when_ok(:update)
      end)
      |> add_operation(:version, fn
        %{terraform: %Terraform{latest_version: v}} when not is_nil(v) ->
          attrs
          |> Map.merge(added)
          |> Map.put(:version, v)
          |> Versions.create_version(:terraform, id, user)
        _ -> {:ok, nil}
      end)
      |> execute(extract: :terraform)
    end
  end

  @doc "Self-explanatory"
  @spec delete_terraform(binary, User.t) :: {:ok, Terraform.t} | {:error, term}
  def delete_terraform(id, user) do
    get_tf!(id)
    |> allow(user, :edit)
    |> when_ok(:delete)
  end

  @doc "self explanatory"
  @spec create_terraform_installation(map, binary, User.t) :: terraform_installation_resp
  def create_terraform_installation(attrs, installation_id, %User{} = user) do
    installation = Repositories.get_installation!(installation_id)

    %TerraformInstallation{installation_id: installation.id, installation: installation}
    |> TerraformInstallation.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:insert)
  end

  @doc "creates or updates a terraform installation"
  @spec upsert_terraform_installation(map, binary, User.t) :: terraform_installation_resp
  def upsert_terraform_installation(%{terraform_id: tf_id} = attrs, installation_id, %User{} = user) do
    installation = Repositories.get_installation!(installation_id)
    case get_terraform_installation(tf_id, user.id) do
      %TerraformInstallation{} = inst -> inst
      nil -> %TerraformInstallation{installation_id: installation_id, installation: installation}
    end
    |> TerraformInstallation.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(&Core.Repo.insert_or_update/1)
  end

  @doc "self explanatory"
  @spec update_terraform_installation(map, binary, User.t) :: terraform_installation_resp
  def update_terraform_installation(attrs, tf_inst_id, %User{} = user) do
    Core.Repo.get!(TerraformInstallation, tf_inst_id)
    |> Core.Repo.preload([:installation, :terraform])
    |> TerraformInstallation.changeset(attrs)
    |> allow(user, :create)
    |> when_ok(:update)
  end

  @doc "self explanatory"
  @spec delete_terraform_installation(binary, User.t) :: terraform_installation_resp
  def delete_terraform_installation(tf_inst_id, %User{} = user) do
    Core.Repo.get!(TerraformInstallation, tf_inst_id)
    |> Core.Repo.preload([:installation, :terraform])
    |> allow(user, :delete)
    |> when_ok(:delete)
  end

  def update_latest_version(%Terraform{} = tf, v) do
    Terraform.changeset(tf, %{latest_version: v})
    |> Core.Repo.update()
  end

  @doc """
  Extracts the readme, templated tfvars and deps file for a terraform module
  """
  @spec extract_tf_meta(%{package: %{path: binary, filename: binary}}) :: {:ok, %{readme: binary, values_template: binary, dependencies: binary}} | {:error, term}
  def extract_tf_meta(%{package: %{path: path, filename: file}}) do
    root = grab_root_dir(file)
    path = String.to_charlist(path)
    [rm, valt, deps] = files = ["#{root}/README.md", "#{root}/terraform.tfvars", "#{root}/deps.yaml"]
                         |> Enum.map(&String.to_charlist/1)

    with {:ok, result} <- :erl_tar.extract(path, [:memory, :compressed, {:files, files}]),
         {:ok, deps} <- Dependencies.extract_dependencies(result, deps) do
      {:ok, %{
        readme: extract_tar_file(result, rm),
        values_template: extract_tar_file(result, valt),
        dependencies: deps,
        description: deps["description"],
        latest_version: deps["version"] || "0.1.0"
      }}
    end
  end
  def extract_tf_meta(_), do: {:ok, %{}}

  def extract_tar_file(result, file) do
    case Enum.find(result, &elem(&1, 0) == file) do
      {_, content} -> content
      _ -> nil
    end
  end

  def grab_root_dir(filename) do
    Path.rootname(filename)
    |> Path.basename()
  end
end
