defimpl Core.WorkOS.Handler, for: Core.WorkOS.Events.ConnectionActivated do
  import Core.Services.Base
  alias Core.WorkOS.Resources

  def handle(%@for{id: id, organization_id: org_id, domains: domains}) do
    start_transaction()
    |> add_operation(:org, fn _ ->
      Resources.create_org(org_id, domains)
    end)
    |> add_operation(:enable, fn _ ->
      Resources.toggle_sso(domains, true, id)
      |> ok()
    end)
    |> execute()
  end
end

defimpl Core.WorkOS.Handler, for: Core.WorkOS.Events.ConnectionDeactivated do
  alias Core.WorkOS.Resources
  def handle(%@for{domains: domains}), do: Resources.toggle_sso(domains, false)
end
