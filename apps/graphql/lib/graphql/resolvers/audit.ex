defmodule GraphQl.Resolvers.Audit do
  use GraphQl.Resolvers.Base, model: Core.Schema.Audit

  def list_audits(args, %{context: %{current_user: user}}) do
    Audit.for_account(user.account_id)
    |> Audit.ordered()
    |> paginate(args)
  end

  def audit_metrics(_, %{context: %{current_user: user}}) do
    cutoff = Timex.now() |> Timex.shift(months: -1)
    Audit.for_account(user.account_id)
    |> Audit.created_after(cutoff)
    |> Audit.aggregate()
    |> Core.Repo.all()
    |> ok()
  end
end
