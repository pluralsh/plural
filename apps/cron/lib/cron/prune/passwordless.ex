defmodule Cron.Prune.Passwordless do
  @moduledoc """
  Prunes all old passwordless login attempts
  """
  use Cron
  alias Core.Schema.{PasswordlessLogin, LoginToken}

  @expiry 2

  def run() do
    PasswordlessLogin.older_than(@expiry)
    |> Core.Repo.delete_all()

    LoginToken.older_than(@expiry)
    |> Core.Repo.delete_all()
  end
end
