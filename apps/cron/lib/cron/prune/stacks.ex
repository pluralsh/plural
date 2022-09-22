defmodule Cron.Prune.Stacks do
  @moduledoc """
  Wipes stacks that have reached their expiry date
  """
  use Cron
  alias Core.Schema.Stack

  def run() do
    Stack.expired()
    |> Core.Repo.delete_all()
  end
end
