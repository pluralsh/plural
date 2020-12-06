defmodule Core.Services.Accounts do
  use Core.Services.Base
  import Core.Policies.Account
  alias Core.Schema.{User, Account}

  @type account_resp :: {:ok, Account.t} | {:error, term}

  def get_account!(id), do: Core.Repo.get!(Account, id)

  @doc """
  Creates a fresh account for the user, making him the root user. Returns everything to caller
  """
  @spec create_account(User.t) :: {:ok, %{account: Account.t, user: User.t}} | {:error, term}
  def create_account(%User{email: email} = user) do
    start_transaction()
    |> add_operation(:account, fn _ ->
      %Account{}
      |> Account.changeset(%{name: email})
      |> Ecto.Changeset.change(%{root_user_id: user.id})
      |> Core.Repo.insert()
    end)
    |> add_operation(:user, fn %{account: %{id: id}} ->
      user
      |> Ecto.Changeset.change(%{account_id: id})
      |> Core.Repo.update()
    end)
    |> execute()
  end

  @doc """
  Updates the account of the user if permitted
  """
  @spec update_account(map, User.t) :: account_resp
  def update_account(attributes, %User{account_id: aid} = user) do
    get_account!(aid)
    |> Account.changeset(attributes)
    |> allow(user, :edit)
    |> when_ok(:update)
  end
end