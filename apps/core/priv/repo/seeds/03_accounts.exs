import Botanist

alias Core.Repo
alias Core.Schema.{User, Account}
alias Core.Services.Accounts
import Core.Services.Base

seed do
  User.without_account()
  |> Core.Repo.all()
  |> Enum.map(fn user ->
    {:ok, _} =
      start_transaction()
      |> add_operation(:account, fn _ ->
        Accounts.create_account(user)
      end)
      |> add_operation(:final, fn %{account: %{account: account}} ->
        account
        |> Account.payment_changeset(%{billing_customer_id: user.customer_id})
        |> Repo.update()
      end)
      |> execute(extract: :final)
  end)
end