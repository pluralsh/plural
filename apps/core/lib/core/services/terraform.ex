defmodule Core.Services.Terraform do
  use Core.Services.Base
  import Core.Policies.Terraform
  alias Core.Schema.{Terraform}

  def get_tf!(id), do: Core.Repo.get!(Terraform, id)

  def get_tf!(repo_id, cloud),
    do: Core.Repo.get_by!(Terraform, repository_id: repo_id, cloud: cloud)

  def create_terraform(attrs, repo_id, user) do
    with {:ok, added} <- extract_tf_meta(attrs) do
      %Terraform{repository_id: repo_id}
      |> Terraform.changeset(Map.merge(attrs, added))
      |> allow(user, :create)
      |> when_ok(:insert)
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

  def extract_tf_meta(%{package: %{path: path}}) do
    path = String.to_charlist(path)
    [rm, valt] = files = ~w(README.md terraform.tfvars)
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
end