import Botanist
alias Core.Schema.User

seed do
  confirm_by = Timex.now() |> Timex.shift(days: 10)

  Core.Repo.update_all(User, [set: [email_confirm_by: confirm_by]])
end
