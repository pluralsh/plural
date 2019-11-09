defmodule GraphQl.Resolvers.Terraform do
  use GraphQl.Resolvers.Base, model: Core.Schema.Terraform
  alias Core.Services.Terraform, as: TfSvc

  def query(_, _), do: Terraform

  def resolve_terraform(%{id: id}, _),
    do: {:ok, TfSvc.get_tf!(id)}

  def resolve_terraform_installation(chart, user),
    do: {:ok, TfSvc.get_terraform_installation(chart.id, user.id)}

  def list_terraform(%{repository_id: repo_id} = args, _) do
    Terraform.for_repository(repo_id)
    |> Terraform.ordered()
    |> paginate(args)
  end

  def create_terraform(%{repository_id: repo_id, attributes: attrs}, %{context: %{current_user: user}}),
    do: TfSvc.create_terraform(attrs, repo_id, user)

  def update_terraform(%{id: id, attributes: attrs}, %{context: %{current_user: user}}),
    do: TfSvc.update_terraform(attrs, id, user)

  def create_terraform_installation(%{installation_id: inst_id, attributes: attrs}, %{context: %{current_user: user}}),
    do: TfSvc.create_terraform_installation(attrs, inst_id, user)

  def delete_terraform_installation(%{id: id}, %{context: %{current_user: user}}),
    do: TfSvc.delete_terraform_installation(id, user)

  def editable(tf, user) do
    case Core.Policies.Terraform.can?(user, tf, :edit) do
      {:error, _} -> {:ok, false}
      _ -> {:ok, true}
    end
  end
end