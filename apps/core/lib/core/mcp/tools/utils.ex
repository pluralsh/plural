defmodule Core.MCP.Tools.Utils do
  alias Core.Services.Accounts

  def get_account(id) do
    with {:ok, _id} <- UUID.info(id) do
      {:ok, Accounts.get_account(id)}
    else
      _ -> {:error, "#{id} is not a valid UUID"}
    end
  end
end
