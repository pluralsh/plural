defmodule Core.MCP.Tools.DeleteUser do
  @behaviour Core.MCP.Tool
  import Core.MCP.Tools.Utils
  alias Core.Services.Accounts

  def name(), do: "delete_user"

  def description(), do: "Deletes a user from Plural and leaves other account details intact"

  def schema(), do: %{
    type: "object",
    required: ["email"],
    properties: %{
      account_id: %{
        type: "string",
        description: "The email of the user you want to delete"
      }
    }
  }

  def invoke(%{"email" => email}) do
    case Accounts.delete_user(email) do
      {:ok, _} -> {:ok, "user deleted"}
      {:error, _} -> {:error, "failed to delete user"}
    end
  end
  def invoke(_), do: {:error, "email is required"}
end
