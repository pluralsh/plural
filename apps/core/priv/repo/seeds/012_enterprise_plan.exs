import Botanist

seed do
  {:ok, _} = Core.Services.Payments.setup_plans()
  enterprise = Core.Services.Payments.get_platform_plan_by_name!("Enterprise")

  Ecto.Changeset.change(enterprise, %{enterprise: true})
  |> Core.Repo.update!()
end
