import Botanist

alias Core.Repo
alias Core.Schema.{TerraformInstallation}
alias Core.Services.Terraform, as: TfSvc

seed do
  Core.Repo.all(TerraformInstallation)
  |> Enum.each(fn tf_inst ->
    vs = TfSvc.get_latest_version(tf_inst.terraform_id)

    tf_inst
    |> TerraformInstallation.changeset(%{version_id: vs.id})
    |> Repo.update!()
  end)
end