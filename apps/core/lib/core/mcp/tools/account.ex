defmodule Core.MCP.Tools.Account do
  @behaviour Core.MCP.Tool
  alias Core.Repo
  alias Core.Services.Users
  alias Core.Schema.User

  def name(), do: "account"

  def description(), do: "Fetches the full Plural account given a user email, also including subscription and plan details"

  def schema() do
    %{
      type: "object",
      required: ["email"],
      properties: %{
        email: %{
          type: "string",
          description: "The email of the user whose account you want to look up"
        }
      }
    }
  end

  def invoke(%{"email" => email}) do
    with %User{} = user <- Users.get_user_by_email(email) do
      user = Repo.preload(user, [account: [subscription: :plan]])
      Jason.encode(user)
    else
      _ -> {:ok, "no user with email #{email}"}
    end
  end
  def invoke(_), do: {:error, "email is required"}
end
