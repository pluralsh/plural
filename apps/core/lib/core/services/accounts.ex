defmodule Core.Services.Accounts do
  use Core.Services.Base
  alias Core.Schema.{User, Account}

  @spec create_account(User.t) :: {:ok, %{account: Account.t, user: User.t}} | {:error, term}
  def create_account(%User{email: email} = user) do
    start_transaction()
    |> add_operation(:account, fn _ ->
      %Account{}
      |> Account.changeset(%{name: email})
      |> Core.Repo.insert()
    end)
    |> add_operation(:user, fn %{account: %{id: id}} ->
      user
      |> Ecto.Changeset.change(%{account_id: id})
      |> Core.Repo.update()
    end)
    |> execute()
  end
end