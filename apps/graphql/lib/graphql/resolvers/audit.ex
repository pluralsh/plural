defmodule GraphQl.Resolvers.Audit do
  use GraphQl.Resolvers.Base, model: Core.Schema.Audit

  def list_audits(args, %{context: %{current_user: user}}) do
    Audit.for_account(user.account_id)
    |> Audit.ordered()
    |> paginate(args)
  end
end
