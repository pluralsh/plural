defmodule Watchman.DeployerTest do
  use Watchman.DataCase, async: false
  alias Watchman.Commands.Chartmart
  alias Watchman.Storage.Git
  use Mimic

  setup :set_mimic_global

  describe "#wake/0" do
    test "It will dequeue and deploy a repo" do
      myself = self()
      echo = fn msg ->
        send myself, msg
        {:ok, msg}
      end

      expect(Git, :init, fn -> echo.(:git_init) end)
      |> expect(:revise, & echo.({:commit, &1}))
      |> expect(:push, fn -> echo.(:git_push) end)

      expect(Chartmart, :build, & echo.({:build, &1}))
      |> expect(:deploy, & echo.({:deploy, &1}))


      repo = "chartmart"
      build = insert(:build, repository: repo)
      :ok = Watchman.Deployer.wake()

      assert_receive :git_init
      assert_receive {:build, ^repo}
      assert_receive {:deploy, ^repo}
      assert_receive :git_push

      assert_receive {:commit, msg}
      :timer.sleep(500)
      assert msg =~ repo

      refetched = refetch(build)
      assert refetched.status == :successful
      assert refetched.completed_at
    end
  end
end