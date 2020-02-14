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
end