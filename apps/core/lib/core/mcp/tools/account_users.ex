defmodule Core.MCP.Tools.AccountUsers do
  @behaviour Core.MCP.Tool
  import Core.MCP.Tools.Utils
  alias Core.Schema.{User, Account}

  def name(), do: "account_users"

  def description(), do: "Fetches the users associated with a Plural account"

  def schema(), do: %{
    type: "object",
    required: ["account_id"],
    properties: %{
      account_id: %{
        type: "string",
        description: "The ID of the account you want to fetch users for, must be a UUID"
      }
    }
  }

  def invoke(%{"account_id" => id}) do
    with {:ok, %Account{} = account} <- get_account(id) do
      User.for_account(account.id)
      |> Core.Repo.all()
      |> Enum.map(&Map.take(&1, ~w(id email name)a))
      |> Jason.encode()
    else
      _ -> {:ok, "no account with id #{id}"}
    end
  end
  def invoke(_), do: {:error, "account_id is required"}
end
