defmodule Cron.Prune.RefreshTokens do
  @moduledoc """
  Prunes expired refresh tokens (past absolute age or rotation grace).
  """
  use Cron
  alias Core.Schema.RefreshToken

  def run() do
    RefreshToken.expired()
    |> Core.Repo.delete_all()
  end
end
