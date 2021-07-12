defmodule Cron.Prune.PasswordlessLoginTest do
  use Core.SchemaCase
  alias Cron.Prune.Passwordless

  describe "#run/0" do
    test "it will prune old passwordless login attempts" do
      old = Timex.now() |> Timex.shift(days: -20)
      tokens = insert_list(3, :login_token, inserted_at: old)
      logins = for t <- tokens, do: insert(:passwordless_login, login_token: t, inserted_at: old)

      token = insert(:login_token)
      ignore = insert(:passwordless_login, login_token: token)

      {3, _} = Passwordless.run()

      for t <- tokens,
        do: refute refetch(t)

      for l <- logins,
        do: refute refetch(l)

      assert refetch(ignore)
      assert refetch(token)
    end
  end
end
