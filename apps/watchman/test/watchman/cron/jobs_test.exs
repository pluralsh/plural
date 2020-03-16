defmodule Watchman.Cron.JobsTest do
  use Watchman.DataCase, async: true
  alias Watchman.Cron.Jobs

  describe "#prune_builds/0" do
    test "It will delete expired builds" do
      keep = insert_list(2, :build)
      expire = insert_list(2, :build, inserted_at: Timex.now() |> Timex.shift(days: -3))

      {_, _} = Jobs.prune_builds()

      for build <- keep,
        do: assert refetch(build)

      for build <- expire,
        do: refute refetch(build)
    end
  end

  describe "#prune_invites/0" do
    test "It will delete expired invites" do
      keep = insert_list(2, :invite)
      expire = insert_list(2, :invite, inserted_at: Timex.now() |> Timex.shift(days: -8))

      {_, _} = Jobs.prune_invites()

      for invite <- keep,
        do: assert refetch(invite)

      for invite <- expire,
        do: refute refetch(invite)
    end
  end
end