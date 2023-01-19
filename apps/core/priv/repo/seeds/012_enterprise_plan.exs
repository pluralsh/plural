import Botanist

seed do
  enterprise = Core.Services.Payments.get_platform_plan_by_name!("Enterprise")

  Ecto.Changeset.change(enterprise, %{enterprise: true})
  |> Core.Repo.update!()
end
