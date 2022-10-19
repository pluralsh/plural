defmodule Core.Backfill.UsersTest do
  use Core.SchemaCase, async: true
  alias Core.Backfill.Users

  describe "#onboarding/0" do
    test "it will set onboarding_checklist structs" do
      users = insert_list(3, :user)

      Users.onboarding()

      for user <- users do
        assert refetch(user).onboarding_checklist.dismissed
      end
    end
  end
end
