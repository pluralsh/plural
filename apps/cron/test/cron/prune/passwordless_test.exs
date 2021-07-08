defmodule Cron.Prune.PasswordlessLoginTest do
  use Core.SchemaCase
  alias Cron.Prune.Passwordless

  describe "#run/0" do
    test "it will prune old passwordless login attempts" do
      old = Timex.now() |> Timex.shift(days: -20)
      logins = insert_list(3, :passwordless_login, inserted_at: old)
      ignore = insert(:passwordless_login)

      {3, _} = Passwordless.run()

      for l <- logins,
        do: refute refetch(l)

      assert refetch(ignore)
    end
  end
end
