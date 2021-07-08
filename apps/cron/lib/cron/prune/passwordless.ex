defmodule Cron.Prune.Passwordless do
  @moduledoc """
  Prunes all old passwordless login attempts
  """
  use Cron
  alias Core.Schema.PasswordlessLogin

  @expiry 2

  def run() do
    PasswordlessLogin.older_than(@expiry)
    |> Core.Repo.delete_all()
  end
end
