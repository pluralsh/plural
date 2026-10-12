defmodule Cron.Prune.RefreshTokensTest do
  use Core.SchemaCase
  alias Cron.Prune.RefreshTokens

  describe "#run/0" do
    test "it will prune expired refresh tokens" do
      old = Timex.now() |> Timex.shift(days: -10)
      aged = insert_list(2, :refresh_token, inserted_at: old)
      grace = insert(:refresh_token, expires_at: Timex.shift(Timex.now(), hours: -1))
      keep = insert(:refresh_token)

      {3, _} = RefreshTokens.run()

      for t <- aged, do: refute refetch(t)
      refute refetch(grace)
      assert refetch(keep)
    end
  end
end
